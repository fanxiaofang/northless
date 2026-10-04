import assert from 'node:assert/strict';
import {
  STORAGE_KEYS, RECOVERY_SNAPSHOT_KEY, applyBackupAtomically, createCurrentSnapshot,
  getInitialSeedData, getRecoverySnapshot, parseBackup, resetToSeedData,
  restoreRecoverySnapshot, validateBackup,
} from '../src/lib/storage';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  failKey: string | null = null;
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    if (key === this.failKey) { this.failKey = null; throw new Error('simulated quota failure'); }
    this.values.set(key, value);
  }
  entries() { return [...this.values.entries()].sort(([a], [b]) => a.localeCompare(b)); }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { value: storage });
const seed = getInitialSeedData();
for (const [key, value] of Object.entries({
  [STORAGE_KEYS.TRACKS]: seed.tracks,
  [STORAGE_KEYS.ACTIONS]: seed.actions,
  [STORAGE_KEYS.LOGS]: seed.logs,
  [STORAGE_KEYS.INBOX]: seed.inbox,
  [STORAGE_KEYS.CARDS]: seed.cards,
  [STORAGE_KEYS.DAY_CLOSES]: seed.dayCloses,
})) storage.setItem(key, JSON.stringify(value));

const original = createCurrentSnapshot();
assert.equal(original.kind, 'northless-backup');
assert.equal(original.format_version, 1);
assert.deepEqual(Object.keys(original.data).sort(), ['actions', 'cards', 'day_closes', 'inbox', 'logs', 'tracks']);
assert.equal(parseBackup(JSON.stringify(original)).ok, true);

const invalids = [
  ['{}', 'INVALID_FORMAT'],
  [JSON.stringify({ ...original, data: { ...original.data, logs: undefined } }), 'INVALID_DATA'],
  [JSON.stringify({ ...original, format_version: 2 }), 'UNSUPPORTED_VERSION'],
  ['not json', 'INVALID_JSON'],
] as const;
for (const [input, code] of invalids) {
  const result = parseBackup(input);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, code);
}

const legacy = {
  version: '1.0.0', exported_at: original.exported_at,
  ...original.data,
};
assert.equal(parseBackup(JSON.stringify(legacy)).ok, true);
const modified = structuredClone(original);
modified.data.tracks = [];
modified.data.logs = [];
assert.equal(validateBackup(modified).ok, true);
assert.deepEqual(storage.getItem(STORAGE_KEYS.TRACKS), JSON.stringify(seed.tracks));

storage.failKey = STORAGE_KEYS.LOGS;
const beforeFailure = storage.entries();
const failed = applyBackupAtomically(modified);
assert.equal(failed.ok, false);
assert.deepEqual(storage.entries(), beforeFailure, 'failure must roll back data and recovery metadata');

assert.equal(applyBackupAtomically(modified).ok, true);
assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEYS.TRACKS)!), []);
assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEYS.LOGS)!), []);
assert.equal(getRecoverySnapshot()?.reason, 'before-import');
assert.equal(restoreRecoverySnapshot().ok, true);
assert.equal(storage.getItem(STORAGE_KEYS.TRACKS), JSON.stringify(seed.tracks));
assert.equal(getRecoverySnapshot()?.backup.data.tracks.length, 0, 'recovery restore must itself be undoable');

const beforeResetFailure = storage.entries();
storage.failKey = STORAGE_KEYS.CARDS;
assert.equal(resetToSeedData().ok, false);
assert.deepEqual(storage.entries(), beforeResetFailure, 'failed reset must roll back');

assert.equal(resetToSeedData().ok, true);
assert.equal(getRecoverySnapshot()?.reason, 'before-reset');
assert.ok(storage.getItem(RECOVERY_SNAPSHOT_KEY));
console.log('Backup format, legacy migration, validation, rollback, recovery and reset checks passed.');
