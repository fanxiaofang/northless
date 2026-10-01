import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActiveSession,
  Card,
  DayClose,
  EntryType,
  InboxItem,
  LogEntry,
  NextAction,
  Phase,
  ScoredCandidate,
  Track,
  TrackRole
} from './types';
import {
  STORAGE_KEYS,
  checkReentryStatus,
  dismissReentryPrompt,
  exportAllData,
  importAllData,
  initializeStorageIfNeeded,
  loadData,
  resetToSeedData,
  saveData
} from './lib/storage';
import {
  EffortFilter,
  getRecommendations,
  getTodayDateStr
} from './lib/recommendation';
import { generateAiPromptContext } from './lib/aiExporter';
import { NavigationSidebar } from './components/NavigationSidebar';
import { TodayView } from './components/TodayView';
import { TracksView } from './components/TracksView';
import { HistoryView } from './components/HistoryView';
import { InboxView } from './components/InboxView';
import { LogModal } from './components/modals/LogModal';
import { EndTodayModal } from './components/modals/EndTodayModal';
import { ReentryModal } from './components/modals/ReentryModal';
import { ScoreExplanationModal } from './components/modals/ScoreExplanationModal';
import { CardViewerModal } from './components/modals/CardViewerModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AiExportModal } from './components/modals/AiExportModal';

export default function App() {
  // Initialize storage once
  useEffect(() => {
    initializeStorageIfNeeded();
  }, []);

  const todayStr = useMemo(() => getTodayDateStr(), []);

  // Primary State
  const [currentView, setCurrentView] = useState<'today' | 'tracks' | 'history' | 'inbox'>('today');

  const [phases, setPhases] = useState<Phase[]>(() => loadData(STORAGE_KEYS.PHASES, []));
  const [currentPhaseId, setCurrentPhaseId] = useState<string>(() =>
    loadData(STORAGE_KEYS.CURRENT_PHASE_ID, 'phase_agent')
  );

  const [tracks, setTracks] = useState<Track[]>(() => loadData(STORAGE_KEYS.TRACKS, []));
  const [actions, setActions] = useState<NextAction[]>(() => loadData(STORAGE_KEYS.ACTIONS, []));
  const [logs, setLogs] = useState<LogEntry[]>(() => loadData(STORAGE_KEYS.LOGS, []));
  const [inbox, setInbox] = useState<InboxItem[]>(() => loadData(STORAGE_KEYS.INBOX, []));
  const [cards, setCards] = useState<Card[]>(() => loadData(STORAGE_KEYS.CARDS, []));
  const [dayCloses, setDayCloses] = useState<DayClose[]>(() => loadData(STORAGE_KEYS.DAY_CLOSES, []));

  // Active Session state
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() =>
    loadData(STORAGE_KEYS.ACTIVE_SESSION, null)
  );

  // Recommendations effort filter & cycle offset
  const [effortFilter, setEffortFilter] = useState<EffortFilter>('all');
  const [rotationOffset, setRotationOffset] = useState<number>(0);
  const [shouldOpenNewTrackComposer, setShouldOpenNewTrackComposer] = useState(false);
  const [returnToTodayAfterNewTrack, setReturnToTodayAfterNewTrack] = useState(false);

  // Modals state
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showEndTodayModal, setShowEndTodayModal] = useState<boolean>(false);
  const [showReentryModal, setShowReentryModal] = useState<boolean>(false);
  const [selectedScoreCandidate, setSelectedScoreCandidate] = useState<ScoredCandidate | null>(null);
  const [selectedCardForView, setSelectedCardForView] = useState<Card | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAiExportModal, setShowAiExportModal] = useState<boolean>(false);
  const [aiExportContent, setAiExportContent] = useState<string>('');

  // Check Re-entry on initial mount
  useEffect(() => {
    const status = checkReentryStatus(todayStr);
    if (status.shouldPrompt) {
      setShowReentryModal(true);
      dismissReentryPrompt(todayStr);
    }
  }, [todayStr]);

  // Synchronize state with LocalStorage
  useEffect(() => {
    saveData(STORAGE_KEYS.PHASES, phases);
  }, [phases]);

  useEffect(() => {
    saveData(STORAGE_KEYS.CURRENT_PHASE_ID, currentPhaseId);
  }, [currentPhaseId]);

  useEffect(() => {
    saveData(STORAGE_KEYS.TRACKS, tracks);
  }, [tracks]);

  useEffect(() => {
    saveData(STORAGE_KEYS.ACTIONS, actions);
  }, [actions]);

  useEffect(() => {
    saveData(STORAGE_KEYS.LOGS, logs);
  }, [logs]);

  useEffect(() => {
    saveData(STORAGE_KEYS.INBOX, inbox);
  }, [inbox]);

  useEffect(() => {
    saveData(STORAGE_KEYS.CARDS, cards);
  }, [cards]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DAY_CLOSES, dayCloses);
  }, [dayCloses]);

  useEffect(() => {
    saveData(STORAGE_KEYS.ACTIVE_SESSION, activeSession);
  }, [activeSession]);

  // Active Session live seconds ticker
  useEffect(() => {
    if (!activeSession || !activeSession.is_running) return;

    const timer = setInterval(() => {
      setActiveSession(prev => {
        if (!prev || !prev.is_running) return prev;
        return {
          ...prev,
          elapsed_seconds: prev.elapsed_seconds + 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession?.is_running]);

  // Keyboard shortcut listeners (⌘K, N, S, T, I, 1-4) with strict Focus Protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K is always allowed anywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowLogModal(false);
        setShowEndTodayModal(false);
        setShowReentryModal(false);
        setSelectedScoreCandidate(null);
        setSelectedCardForView(null);
        setShowSettingsModal(false);
        setShowAiExportModal(false);
        return;
      }

      // Check if user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          target.getAttribute('contenteditable') === 'true');

      // Check if any modal or overlay is open
      const isModalOpen =
        showCommandPalette ||
        showLogModal ||
        showEndTodayModal ||
        showReentryModal ||
        !!selectedScoreCandidate ||
        !!selectedCardForView ||
        showSettingsModal ||
        showAiExportModal;

      // Single-letter shortcuts are strictly disabled during input focus or modal presentation
      if (!isInputFocused && !isModalOpen) {
        const key = e.key.toLowerCase();
        if (key === '1' || key === 't') {
          e.preventDefault();
          setCurrentView('today');
        } else if (key === '2') {
          e.preventDefault();
          setCurrentView('tracks');
        } else if (key === '3' || key === 'h') {
          e.preventDefault();
          setCurrentView('history');
        } else if (key === '4' || key === 'i') {
          e.preventDefault();
          setCurrentView('inbox');
        } else if (key === 'n' || key === 'l') {
          e.preventDefault();
          setShowLogModal(true);
        } else if (key === 's') {
          e.preventDefault();
          setShowLogModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showCommandPalette,
    showLogModal,
    showEndTodayModal,
    showReentryModal,
    selectedScoreCandidate,
    selectedCardForView,
    showSettingsModal,
    showAiExportModal,
  ]);

  // Derived state
  const currentPhase = useMemo(
    () => phases.find(p => p.id === currentPhaseId) || phases[0],
    [phases, currentPhaseId]
  );

  const pinnedCards = useMemo(
    () => cards.filter(c => c.pinned).sort((a, b) => a.position - b.position),
    [cards]
  );

  const todayLogs = useMemo(
    () => logs.filter(l => l.date === todayStr).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [logs, todayStr]
  );

  // Recommendations calculated via deterministic scoring
  const recommendations = useMemo(() => {
    return getRecommendations(actions, tracks, logs, effortFilter, rotationOffset, todayStr);
  }, [actions, tracks, logs, effortFilter, rotationOffset, todayStr]);

  // Handlers for Session
  const handleStartSession = useCallback(
    (trackId: string, actionId?: string, title?: string) => {
      const taskTitle =
        title ||
        (trackId
          ? `${tracks.find(t => t.id === trackId)?.name || ''} 专注探索`
          : '自由专注');

      setActiveSession({
        track_id: trackId,
        action_id: actionId,
        task_title: taskTitle,
        started_at: Date.now(),
        elapsed_seconds: 0,
        is_running: true,
      });

      // Jump to today view to see the chronometer
      setCurrentView('today');
    },
    [tracks]
  );

  const handlePauseResumeSession = useCallback(() => {
    setActiveSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        is_running: !prev.is_running,
      };
    });
  }, []);

  const handleStopSession = useCallback(
    (note?: string) => {
      if (!activeSession) return;

      const durationMinutes = Math.max(1, Math.round(activeSession.elapsed_seconds / 60));
      const now = new Date();
      const endH = String(now.getHours()).padStart(2, '0');
      const endM = String(now.getMinutes()).padStart(2, '0');

      const past = new Date(now.getTime() - durationMinutes * 60000);
      const startH = String(past.getHours()).padStart(2, '0');
      const startM = String(past.getMinutes()).padStart(2, '0');

      const newLog: LogEntry = {
        id: `log_${Date.now()}`,
        date: todayStr,
        track_id: activeSession.track_id || undefined,
        type: 'session',
        content: note || activeSession.task_title,
        started_at: `${startH}:${startM}`,
        ended_at: `${endH}:${endM}`,
        duration_minutes: durationMinutes,
        created_at: new Date().toISOString(),
      };

      setLogs(prev => [newLog, ...prev]);

      // Update track's last_touched_at if touched
      if (activeSession.track_id) {
        setTracks(prev =>
          prev.map(t =>
            t.id === activeSession.track_id ? { ...t, last_touched_at: todayStr } : t
          )
        );
      }

      setActiveSession(null);
    },
    [activeSession, todayStr]
  );

  const handleCancelSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  const handleToggleSession = useCallback(() => {
    if (activeSession) {
      handlePauseResumeSession();
    } else {
      handleStartSession('', undefined, '自由专注');
    }
  }, [activeSession, handlePauseResumeSession, handleStartSession, tracks]);

  // Handlers for NextAction
  const handleCompleteAction = useCallback(
    (actionId: string) => {
      const act = actions.find(a => a.id === actionId);
      if (!act) return;

      const track = tracks.find(t => t.id === act.track_id);

      // Create a completed session log in ledger
      const newLog: LogEntry = {
        id: `log_${Date.now()}`,
        date: todayStr,
        track_id: act.track_id,
        type: 'session',
        content: `完成: ${act.title}${act.note ? ` (${act.note})` : ''}`,
        duration_minutes: act.effort === 'deep' ? 60 : act.effort === 'normal' ? 30 : 15,
        created_at: new Date().toISOString(),
      };

      setLogs(prev => [newLog, ...prev]);

      // Mark action done
      setActions(prev =>
        prev.map(a =>
          a.id === actionId
            ? { ...a, status: 'done', completed_at: new Date().toISOString() }
            : a
        )
      );

      // Update last_touched_at on track
      setTracks(prev =>
        prev.map(t => (t.id === act.track_id ? { ...t, last_touched_at: todayStr } : t))
      );
    },
    [actions, todayStr, tracks]
  );

  const handleAddNextAction = useCallback(
    (trackId: string, title: string, effort: 'light' | 'normal' | 'deep', note?: string) => {
      const newAction: NextAction = {
        id: `act_${Date.now()}`,
        track_id: trackId,
        title,
        note,
        effort,
        status: 'active',
        position: actions.filter(a => a.track_id === trackId).length,
        created_at: todayStr,
      };
      setActions(prev => [...prev, newAction]);
    },
    [actions, todayStr]
  );

  const handleDeleteAction = useCallback((actionId: string) => {
    setActions(prev => prev.filter(a => a.id !== actionId));
  }, []);

  // Handlers for Tracks & Stages
  const handleUpdateTrackRole = useCallback((trackId: string, role: TrackRole) => {
    setTracks(prev => prev.map(t => (t.id === trackId ? { ...t, role } : t)));
  }, []);

  const handleUpdateTrackStage = useCallback((trackId: string, stageIndex: number) => {
    setTracks(prev => prev.map(t => (t.id === trackId ? { ...t, current_stage_index: stageIndex } : t)));
  }, []);

  const handleAddNewTrack = useCallback(
    (name: string, description: string, role: TrackRole, stages: string[]) => {
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        name,
        description,
        role,
        roadmap: stages,
        current_stage_index: 0,
        status: 'active',
        created_at: todayStr,
      };
      setTracks(prev => [...prev, newTrack]);
    },
    [todayStr]
  );

  // Handlers for Ledger Logs
  const handleAddLog = useCallback(
    (data: {
      type: EntryType;
      track_id?: string;
      content: string;
      duration_minutes?: number;
      started_at?: string;
      ended_at?: string;
    }) => {
      const newLog: LogEntry = {
        id: `log_${Date.now()}`,
        date: todayStr,
        ...data,
        created_at: new Date().toISOString(),
      };
      setLogs(prev => [newLog, ...prev]);

      if (data.track_id) {
        setTracks(prev =>
          prev.map(t => (t.id === data.track_id ? { ...t, last_touched_at: todayStr } : t))
        );
      }
    },
    [todayStr]
  );

  const handleDeleteLog = useCallback((logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
  }, []);

  // Handlers for Day Close (End Today)
  const handleDayClose = useCallback(
    (note?: string, carryForward?: string) => {
      const record: DayClose = {
        date: todayStr,
        note,
        carry_forward: carryForward,
        closed_at: new Date().toISOString(),
      };
      setDayCloses(prev => [record, ...prev.filter(dc => dc.date !== todayStr)]);
    },
    [todayStr]
  );

  // Handlers for Inbox
  const handleAddInboxItem = useCallback(
    (content: string, trackId?: string) => {
      const newItem: InboxItem = {
        id: `inbox_${Date.now()}`,
        content,
        track_id: trackId,
        status: 'inbox',
        created_at: todayStr,
      };
      setInbox(prev => [newItem, ...prev]);
    },
    [todayStr]
  );

  const handlePromoteInboxToNext = useCallback(
    (item: InboxItem, trackId: string, title: string, effort: 'light' | 'normal' | 'deep') => {
      // Add as NextAction
      handleAddNextAction(trackId, title, effort, `来自收集箱: ${item.content}`);

      // Mark inbox item promoted
      setInbox(prev => prev.map(i => (i.id === item.id ? { ...i, status: 'promoted' } : i)));
    },
    [handleAddNextAction]
  );

  const handleArchiveInboxItem = useCallback((itemId: string) => {
    setInbox(prev => prev.map(i => (i.id === itemId ? { ...i, status: 'archived' } : i)));
  }, []);

  const handleDeleteInboxItem = useCallback((itemId: string) => {
    setInbox(prev => prev.filter(i => i.id !== itemId));
  }, []);

  // Handlers for Cards
  const handleAddCard = useCallback(
    (title: string, url: string, description?: string, pinned: boolean = true) => {
      const newCard: Card = {
        id: `card_${Date.now()}`,
        title,
        url,
        description,
        type: 'link',
        pinned,
        position: cards.length,
      };
      setCards(prev => [...prev, newCard]);
    },
    [cards.length]
  );

  const handleTogglePinCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c => (c.id === cardId ? { ...c, pinned: !c.pinned } : c)));
  }, []);

  const handleDeleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  // AI Prompt Export
  const handleOpenAiExport = useCallback(() => {
    const text = generateAiPromptContext(tracks, actions, logs, currentPhase, todayStr);
    setAiExportContent(text);
    setShowAiExportModal(true);
  }, [actions, currentPhase, logs, todayStr, tracks]);

  // Data Export & Import
  const handleExportData = useCallback(() => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gap-cockpit-backup-${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [todayStr]);

  const handleImportData = useCallback((jsonStr: string) => {
    return importAllData(jsonStr);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#151413] text-[var(--text-primary)]">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        currentPhase={currentPhase}
        pinnedCards={pinnedCards}
        onOpenCard={card => setSelectedCardForView(card)}
        onOpenAddCard={() => setShowSettingsModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAiExport={handleOpenAiExport}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        isSessionRunning={!!activeSession?.is_running}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden cockpit-main">
        {currentView === 'today' && (
          <TodayView
            currentDateStr={todayStr}
            currentPhase={currentPhase}
            tracks={tracks}
            actions={actions}
            todayLogs={todayLogs}
            pinnedCards={pinnedCards}
            recommendations={recommendations}
            activeSession={activeSession}
            effortFilter={effortFilter}
            onSetEffortFilter={setEffortFilter}
            onShuffleRecommendations={() => setRotationOffset(prev => prev + 1)}
            onStartSession={handleStartSession}
            onPauseResumeSession={handlePauseResumeSession}
            onStopSession={handleStopSession}
            onCancelSession={handleCancelSession}
            onCompleteAction={handleCompleteAction}
            onOpenLogModal={() => setShowLogModal(true)}
            onOpenEndTodayModal={() => setShowEndTodayModal(true)}
            onOpenReentryModal={() => setShowReentryModal(true)}
            onOpenScoreExplanation={candidate => setSelectedScoreCandidate(candidate)}
            onOpenCard={card => setSelectedCardForView(card)}
            onDeleteLog={handleDeleteLog}
            onSelectTrackView={() => setCurrentView('tracks')}
            onCreateFirstTrack={() => {
              setShouldOpenNewTrackComposer(true);
              setReturnToTodayAfterNewTrack(true);
              setCurrentView('tracks');
            }}
            onAddNextAction={handleAddNextAction}
          />
        )}

        {currentView === 'tracks' && (
          <TracksView
            tracks={tracks}
            actions={actions}
            logs={logs}
            cards={cards}
            currentPhase={currentPhase}
            currentDateStr={todayStr}
            onUpdateTrackRole={handleUpdateTrackRole}
            onUpdateTrackStage={handleUpdateTrackStage}
            onAddNextAction={handleAddNextAction}
            onCompleteAction={handleCompleteAction}
            onDeleteAction={handleDeleteAction}
            onStartSession={handleStartSession}
            onOpenCard={card => setSelectedCardForView(card)}
            onAddNewTrack={handleAddNewTrack}
            onOpenPhaseSettings={() => setShowSettingsModal(true)}
            shouldOpenNewTrackComposer={shouldOpenNewTrackComposer}
            onNewTrackComposerOpened={() => setShouldOpenNewTrackComposer(false)}
            onCreatedFromToday={returnToTodayAfterNewTrack ? () => {
              setReturnToTodayAfterNewTrack(false);
              setCurrentView('today');
            } : undefined}
            onNewTrackComposerDismissed={() => setReturnToTodayAfterNewTrack(false)}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            tracks={tracks}
            logs={logs}
            dayCloses={dayCloses}
            currentDateStr={todayStr}
          />
        )}

        {currentView === 'inbox' && (
          <InboxView
            inboxItems={inbox}
            tracks={tracks}
            onAddInboxItem={handleAddInboxItem}
            onPromoteToNext={handlePromoteInboxToNext}
            onArchiveInboxItem={handleArchiveInboxItem}
            onDeleteInboxItem={handleDeleteInboxItem}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {showLogModal && (
        <LogModal
          tracks={tracks}
          onClose={() => setShowLogModal(false)}
          onSubmit={handleAddLog}
        />
      )}

      {showEndTodayModal && (
        <EndTodayModal
          currentDateStr={todayStr}
          tracks={tracks}
          todayLogs={todayLogs}
          onClose={() => setShowEndTodayModal(false)}
          onSubmitDayClose={handleDayClose}
        />
      )}

      {showReentryModal && (
        <ReentryModal
          currentDateStr={todayStr}
          tracks={tracks}
          actions={actions}
          recommendations={recommendations}
          onClose={() => setShowReentryModal(false)}
          onStartSession={handleStartSession}
          onRecordReentryNote={note => {
            handleAddLog({
              type: 'note',
              content: `回归记录: ${note}`,
            });
          }}
        />
      )}

      {selectedScoreCandidate && (
        <ScoreExplanationModal
          candidate={selectedScoreCandidate}
          onClose={() => setSelectedScoreCandidate(null)}
        />
      )}

      {selectedCardForView && (
        <CardViewerModal
          card={selectedCardForView}
          onClose={() => setSelectedCardForView(null)}
        />
      )}

      {showCommandPalette && (
        <CommandPaletteModal
          onClose={() => setShowCommandPalette(false)}
          onSelectView={setCurrentView}
          onOpenLogModal={() => setShowLogModal(true)}
          onOpenEndTodayModal={() => setShowEndTodayModal(true)}
          onOpenReentryModal={() => setShowReentryModal(true)}
          onOpenAiExport={handleOpenAiExport}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenCard={card => setSelectedCardForView(card)}
          cards={cards}
          isSessionRunning={!!activeSession?.is_running}
          onToggleSession={handleToggleSession}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          phases={phases}
          currentPhaseId={currentPhaseId}
          onSelectPhase={setCurrentPhaseId}
          onCreatePhase={(name, note) => {
            const newPhase: Phase = {
              id: `phase_${Date.now()}`,
              name,
              started_at: todayStr,
              note,
            };
            setPhases(prev => [...prev, newPhase]);
            setCurrentPhaseId(newPhase.id);
          }}
          cards={cards}
          onAddCard={handleAddCard}
          onTogglePinCard={handleTogglePinCard}
          onDeleteCard={handleDeleteCard}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetData={resetToSeedData}
          onOpenAiExport={handleOpenAiExport}
        />
      )}

      {showAiExportModal && (
        <AiExportModal
          content={aiExportContent}
          onClose={() => setShowAiExportModal(false)}
        />
      )}
    </div>
  );
}
