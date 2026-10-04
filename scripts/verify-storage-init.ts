import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { runInNewContext } from 'node:vm';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  getItem(key: string) { return this.values.get(key) ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
  snapshot() { return [...this.values.entries()].sort(([a], [b]) => a.localeCompare(b)); }
}

type StorageModule = typeof import('../src/lib/storage');

async function loadForMode(dev: boolean, storage: Storage): Promise<StorageModule> {
  const result = await build({
    entryPoints: ['src/lib/storage.ts'], bundle: true, platform: 'node', format: 'cjs',
    write: false, define: { 'import.meta.env.DEV': String(dev) },
  });
  const module = { exports: {} as Record<string, unknown> };
  runInNewContext(result.outputFiles[0].text, { module, exports: module.exports, localStorage: storage, console, Date });
  return module.exports as StorageModule;
}

const collectionNames = ['TRACKS', 'ACTIONS', 'LOGS', 'INBOX', 'CARDS', 'DAY_CLOSES'] as const;

function assertEmpty(api: StorageModule, storage: Storage) {
  for (const name of collectionNames) {
    assert.equal(storage.getItem(api.STORAGE_KEYS[name]), '[]', `${name} should be empty`);
  }
  assert.equal(storage.getItem(api.STORAGE_KEYS.ACTIVE_SESSION), 'null');
}

for (const dev of [true, false]) {
  const storage = new MemoryStorage();
  const api = await loadForMode(dev, storage);
  api.initializeStorageIfNeeded();
  if (dev) {
    assert.deepEqual(JSON.parse(storage.getItem(api.STORAGE_KEYS.TRACKS)!).map((track: { id: string }) => track.id),
      Array.from(api.getInitialSeedData().tracks, track => track.id));
    for (const name of collectionNames) assert.ok(JSON.parse(storage.getItem(api.STORAGE_KEYS[name])!).length);
  } else {
    assertEmpty(api, storage);
  }
  const firstBoot = storage.snapshot();
  api.initializeStorageIfNeeded();
  api.initializeStorageIfNeeded();
  assert.deepEqual(storage.snapshot(), firstBoot, 'refresh must be idempotent');

  const editedTracks = JSON.stringify([{ ...api.getInitialSeedData().tracks[0], name: 'My edited track' }]);
  storage.setItem(api.STORAGE_KEYS.TRACKS, editedTracks);
  api.initializeStorageIfNeeded();
  assert.equal(storage.getItem(api.STORAGE_KEYS.TRACKS), editedTracks, 'existing edits must survive refresh');

  storage.setItem(api.STORAGE_KEYS.TRACKS, '[]');
  for (const name of collectionNames) storage.setItem(api.STORAGE_KEYS[name], '[]');
  api.initializeStorageIfNeeded();
  assertEmpty(api, storage);

  storage.clear();
  const userLog = JSON.stringify([{ id: 'user-log', content: 'keep me' }]);
  storage.setItem(api.STORAGE_KEYS.LOGS, userLog);
  storage.setItem(api.STORAGE_KEYS.INBOX, '[]');
  api.initializeStorageIfNeeded();
  assert.equal(storage.getItem(api.STORAGE_KEYS.LOGS), userLog);
  assertEmptyExceptLogs(api, storage);

  storage.clear();
  storage.setItem(api.STORAGE_KEYS.TRACKS, JSON.stringify([{
    ...api.getInitialSeedData().tracks[0],
    description: '掌握现代 Agent 开发，并形成一个可以用于求职展示的项目。',
  }]));
  api.initializeStorageIfNeeded();
  const migratedTracks = JSON.parse(storage.getItem(api.STORAGE_KEYS.TRACKS)!);
  assert.equal(migratedTracks.length, 1, 'legacy migration must not inject demo tracks');
  assert.equal(migratedTracks[0].description, api.getInitialSeedData().tracks[0].description);

  storage.clear();
  api.initializeStorageIfNeeded();
  const emptyBackup = api.createCurrentSnapshot();
  for (const name of collectionNames) emptyBackup.data[name.toLowerCase() as keyof typeof emptyBackup.data] = [];
  assert.equal(api.applyBackupAtomically(emptyBackup).ok, true);
  api.initializeStorageIfNeeded();
  assertEmpty(api, storage);

  if (!dev) {
    assert.equal(api.resetToSeedData().ok, true);
    assert.ok(JSON.parse(storage.getItem(api.STORAGE_KEYS.TRACKS)!).some((track: { id: string }) => track.id === 'track_snake_demo'));
    assert.equal(api.getRecoverySnapshot()?.reason, 'before-reset');
  }
}

function assertEmptyExceptLogs(api: StorageModule, storage: Storage) {
  for (const name of collectionNames.filter(name => name !== 'LOGS')) {
    assert.equal(storage.getItem(api.STORAGE_KEYS[name]), '[]', `${name} should be empty`);
  }
  assert.equal(storage.getItem(api.STORAGE_KEYS.ACTIVE_SESSION), 'null');
}

console.log('DEV/PROD initialization, refresh, partial data, empty restore, and manual reset checks passed.');
