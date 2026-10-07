import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from './domain/task';
import type { Category } from './domain/category';
import { compareReminders, type Reminder } from './domain/reminder';
import { colorForWeek, confettiColors, weekVars } from './domain/palette';
import { addDays, getWeekKey, toDayKey } from './domain/week';
import type { Backend } from './data/backend';
import { useTasks } from './hooks/useTasks';
import { useCategories } from './hooks/useCategories';
import { useReminders } from './hooks/useReminders';
import { useUndo } from './hooks/useUndo';
import { currentDate, useToday } from './hooks/useToday';
import { useHotkeys } from './hooks/useHotkeys';
import { useSettings, type ThemePref } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { useCustomBackground } from './hooks/useCustomBackground';
import { findBackground, BACKGROUNDS } from './domain/backgrounds';
import { AppearanceView } from './components/AppearanceView';
import { MigrationBanner } from './components/MigrationBanner';
import { HelpDrawer } from './components/HelpDrawer';
import { burstFrom, celebrate } from './lib/confetti';
import { playCelebrate, playComplete } from './lib/sound';
import { Sidebar, type View } from './components/Sidebar';
import { Header } from './components/Header';
import { QuickAdd } from './components/QuickAdd';
import { TaskCard } from './components/TaskCard';
import { SortToggle } from './components/SortToggle';
import { SortableTaskList } from './components/SortableTaskList';
import { CategoryGroups, type Group } from './components/CategoryGroups';
import { CalendarView, type DayItems } from './components/CalendarView';
import { CategoriesView } from './components/CategoriesView';
import { ProgressCard } from './components/ProgressCard';
import { MiniCalendar, type DayMarks } from './components/MiniCalendar';
import { DayAgenda } from './components/DayAgenda';
import { CompletedDrawer } from './components/CompletedDrawer';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import { DebugTimeTravel } from './components/DebugTimeTravel'; // PRUEBA

const HASH: Record<View, string> = { home: '', calendar: '#calendario', categories: '#categorias', appearance: '#apariencia' };
const viewFromHash = (): View => (Object.keys(HASH) as View[]).find((v) => HASH[v] && HASH[v] === location.hash) ?? 'home';

export type Account = { email: string; onSignOut: () => void };

export default function App({ backend, account }: { backend: Backend; account?: Account }) {
  const now = useToday();
  const weekKey = getWeekKey(now);
  const todayKey = toDayKey(now);
  const color = colorForWeek(weekKey);

  const { tasks, loaded, add, update, remove, restore } = useTasks(backend.tasks);
  const cats = useCategories(backend.categories);
  const { categories } = cats;
  const rem = useReminders(backend.reminders);
  const { toast, push, notify, undoLast, dismiss } = useUndo();
  const [settings, setSettings] = useSettings(backend.settings, backend.settingsCacheKey);
  useTheme(settings.theme);
  const customBg = useCustomBackground(backend.background);
  const bgCss =
    settings.background === 'custom' && customBg.url
      ? `url(${customBg.url}) center / cover`
      : (findBackground(settings.background) ?? BACKGROUNDS[0]).css;

  // Elegir fondo propone su tema, salvo que el usuario haya fijado uno a mano.
  const selectBackground = useCallback(
    (id: string, suggested?: 'light' | 'dark') => {
      const theme = suggested ?? findBackground(id)?.suggestedTheme;
      setSettings({ background: id, ...(!settings.themeLocked && theme ? { theme } : {}) });
    },
    [setSettings, settings.themeLocked],
  );
  const uploadBackground = useCallback(
    async (file: File) => {
      const luminance = await customBg.upload(file);
      // Por contraste: foto oscura → vidrio claro; foto muy clara → vidrio oscuro.
      selectBackground('custom', luminance > 0.62 ? 'dark' : 'light');
    },
    [customBg, selectBackground],
  );
  const removeCustomBackground = useCallback(() => {
    void customBg.remove();
    if (settings.background === 'custom') selectBackground(BACKGROUNDS[0].id);
  }, [customBg, settings.background, selectBackground]);
  const [completedOpen, setCompletedOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const stopEdit = useCallback(() => setEditingId(null), []);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [online, setOnline] = useState(() => navigator.onLine);

  // Conexión: con cuenta, los cambios necesitan internet. Se avisa si falta o si algo no se guardó.
  useEffect(() => {
    let last = 0;
    const onSyncError = () => {
      if (Date.now() - last < 4000) return;
      last = Date.now();
      notify('No se pudo guardar. Revisa tu conexión.');
    };
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('semanas:sync-error', onSyncError);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('semanas:sync-error', onSyncError);
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, [notify]);
  const inputRef = useRef<HTMLInputElement>(null);
  const agendaInputRef = useRef<HTMLInputElement>(null);

  // Sección actual, reflejada en la dirección (#calendario, #categorias) para que sobreviva a recargar.
  const [view, setViewState] = useState<View>(viewFromHash);
  useEffect(() => {
    const onHash = () => setViewState(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const setView = useCallback((v: View) => {
    history.replaceState(null, '', HASH[v] || location.pathname + location.search);
    setViewState(v);
    setEditingId(null);
  }, []);

  const pending = useMemo(() => tasks.filter((t) => !t.completedAt), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.completedAt), [tasks]);
  const completedIn = (wk: string) => completed.filter((t) => getWeekKey(new Date(t.completedAt!)) === wk).length;
  const doneThisWeek = completedIn(weekKey);
  const doneLastWeek = completedIn(getWeekKey(addDays(now, -7)));

  // Orden personal (arrastrando). Por defecto, lo más antiguo arriba y lo recién anotado al final.
  const sorted = useMemo(() => [...pending].sort((a, b) => a.order - b.order), [pending]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of pending) if (t.categoryId) m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + 1);
    return m;
  }, [pending]);

  const groups = useMemo<Group[]>(() => {
    if (settings.sortBy !== 'category') return [];
    const known = new Set(categories.map((c) => c.id));
    const result: Group[] = categories
      .map((c) => ({ key: c.id, title: c.name, emoji: c.emoji, tasks: sorted.filter((t) => t.categoryId === c.id) }))
      .filter((g) => g.tasks.length > 0);
    const loose = sorted.filter((t) => !t.categoryId || !known.has(t.categoryId));
    if (loose.length) result.push({ key: 'none', title: 'Sin categoría', emoji: '·', tasks: loose });
    return result;
  }, [settings.sortBy, categories, sorted]);

  // Calendario: tareas pendientes con fecha + recordatorios, por día.
  const dayItems = useMemo(() => {
    const m = new Map<string, DayItems>();
    const get = (k: string) => m.get(k) ?? (m.set(k, { tasks: [], reminders: [] }), m.get(k)!);
    for (const t of sorted) if (t.dueDate) get(t.dueDate).tasks.push(t);
    for (const r of [...rem.reminders].sort(compareReminders)) get(r.date).reminders.push(r);
    return m;
  }, [sorted, rem.reminders]);

  const dayMarks = useMemo(() => {
    const m = new Map<string, DayMarks>();
    for (const [k, v] of dayItems) {
      m.set(k, {
        taskColors: v.tasks.map((t) => colorForWeek(t.weekKey).light.accent),
        reminders: v.reminders.filter((r) => !r.done).length,
      });
    }
    return m;
  }, [dayItems]);

  const overdue = useMemo(
    () => (selectedDay === todayKey ? sorted.filter((t) => t.dueDate && t.dueDate < todayKey) : []),
    [selectedDay, todayKey, sorted],
  );

  const handleComplete = useCallback(
    (task: Task, origin: Element) => {
      const c = colorForWeek(task.weekKey);
      update(task.id, { completedAt: currentDate().toISOString() });
      burstFrom(origin, confettiColors(c));
      const isLast = pending.length === 1;
      if (isLast) {
        window.setTimeout(() => celebrate(confettiColors(color)), 250);
        if (settings.sound) playCelebrate();
        notify('¡Todo listo! No queda nada pendiente 🎉');
      } else {
        if (settings.sound) playComplete();
        push('Tarea completada', () => update(task.id, { completedAt: null }));
      }
    },
    [update, pending.length, color, settings.sound, push, notify],
  );

  const handleDelete = useCallback(
    (task: Task) => {
      remove(task.id);
      push('Tarea eliminada', () => restore(task));
    },
    [remove, restore, push],
  );

  const handleRename = useCallback((task: Task, title: string) => update(task.id, { title }), [update]);
  const handleSetDue = useCallback((task: Task, dueDate: string | null) => update(task.id, { dueDate }), [update]);
  const handleSetCategory = useCallback(
    (task: Task, categoryId: string | null) => update(task.id, { categoryId }),
    [update],
  );
  const handleMove = useCallback((task: Task, order: number) => update(task.id, { order }), [update]);

  const handleReopen = useCallback(
    (task: Task) => {
      update(task.id, { completedAt: null });
      push('Tarea devuelta a pendientes', () => update(task.id, { completedAt: task.completedAt }));
    },
    [update, push],
  );

  const handleDeleteCategory = useCallback(
    (category: Category) => {
      cats.remove(category.id);
      push(`Categoría «${category.name}» eliminada`, () => cats.restore(category));
    },
    [cats, push],
  );

  // Reordenar desde la vista por categoría: las categorías sin tareas mantienen su lugar.
  const handleReorderCategories = useCallback(
    (visibleIds: string[]) => {
      const visible = new Set(visibleIds);
      let k = 0;
      const next = categories.map((c) => (visible.has(c.id) ? visibleIds[k++] : c.id));
      next.forEach((id, i) => {
        if (categories.find((c) => c.id === id)?.order !== i) cats.update(id, { order: i });
      });
    },
    [categories, cats],
  );

  const handleToggleReminder = useCallback(
    (r: Reminder) => {
      rem.update(r.id, { done: !r.done });
      if (!r.done && settings.sound) playComplete();
    },
    [rem, settings.sound],
  );

  const handleDeleteReminder = useCallback(
    (r: Reminder) => {
      rem.remove(r.id);
      push('Recordatorio eliminado', () => rem.restore(r));
    },
    [rem, push],
  );

  const openTask = useCallback(
    (task: Task) => {
      setView('home');
      setEditingId(task.id);
    },
    [setView],
  );

  const addOnDay = useCallback((key: string) => {
    setSelectedDay(key);
    window.setTimeout(() => agendaInputRef.current?.focus(), 50);
  }, []);

  useHotkeys({
    focusInput: () => {
      if (view !== 'home') setView('home');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    },
    undo: undoLast,
    escape: () => {
      if (editingId) setEditingId(null);
      else if (completedOpen) setCompletedOpen(false);
      else if (helpOpen) setHelpOpen(false);
      else dismiss();
    },
  });

  const renderCard = (t: Task, drag: { onDragStart: (id: string) => void; onDragEnd: () => void }) => (
    <TaskCard
      key={t.id}
      task={t}
      now={now}
      currentWeekKey={weekKey}
      categories={categories}
      showCategory={settings.sortBy === 'week'}
      onComplete={handleComplete}
      onRename={handleRename}
      onSetDue={handleSetDue}
      onSetCategory={handleSetCategory}
      editing={editingId === t.id}
      onStartEdit={() => setEditingId(t.id)}
      onStopEdit={stopEdit}
      onDelete={handleDelete}
      onDragStart={drag.onDragStart}
      onDragEnd={drag.onDragEnd}
    />
  );

  return (
    <div className="app wk relative" style={{ ...weekVars(color), ['--glass' as string]: settings.glass, ['--card-glass' as string]: settings.cardGlass }}>
      <div className="app-bg" style={{ ['--app-bg' as string]: bgCss }} aria-hidden />
      <div className="shell">
      <div className="relative grid h-full grid-cols-1 overflow-y-auto lg:overflow-visible lg:grid-cols-[84px_minmax(0,1fr)_300px] xl:grid-cols-[236px_minmax(0,1fr)_330px]">
        <Sidebar
          view={view}
          onNavigate={setView}
          name={settings.name}
          sound={settings.sound}
          onToggleSound={() => setSettings({ sound: !settings.sound })}
          account={account}
          onOpenHelp={() => setHelpOpen(true)}
        />

        <main className="min-w-0 px-4 pt-8 pb-10 sm:px-6 lg:h-full lg:overflow-y-auto lg:px-8 lg:pt-12 lg:pb-28 xl:px-10">
          {view === 'home' && (
            <div className="mx-auto max-w-3xl">
              <Header now={now} name={settings.name} onRename={(name) => setSettings({ name })} weekKey={weekKey} color={color} />

              <div className="mt-8 mb-10">
                <MigrationBanner backend={backend} />
                <QuickAdd
                  ref={inputRef}
                  now={now}
                  categories={categories}
                  onAdd={(title, due, categoryId) => add(title, now, due, categoryId)}
                  onManageCategories={() => setView('categories')}
                />
              </div>

              {loaded &&
                (sorted.length === 0 ? (
                  <EmptyState hasHistory={completed.length > 0} />
                ) : (
                  <section aria-label="Pendientes">
                    <div className="mb-4 flex items-center gap-2 px-1">
                      <h2 className="font-display text-lg font-semibold tracking-tight">Pendientes</h2>
                      <span className="text-sm font-bold text-[var(--ink-faint)] tabular-nums">{sorted.length}</span>
                      <div className="ml-auto">
                        <SortToggle value={settings.sortBy} onChange={(sortBy) => setSettings({ sortBy })} />
                      </div>
                    </div>

                    {settings.sortBy === 'week' ? (
                      <SortableTaskList tasks={sorted} renderCard={renderCard} onMove={handleMove} />
                    ) : (
                      <CategoryGroups
                        groups={groups}
                        editingId={editingId}
                        onReorder={handleReorderCategories}
                        renderTasks={(g) => <SortableTaskList tasks={g.tasks} renderCard={renderCard} onMove={handleMove} />}
                      />
                    )}
                  </section>
                ))}
            </div>
          )}

          {view === 'calendar' && (
            <CalendarView now={now} selected={selectedDay} onSelect={setSelectedDay} onAddOnDay={addOnDay} items={dayItems} />
          )}

          {view === 'appearance' && (
            <div className="mx-auto max-w-3xl">
              <AppearanceView
                background={settings.background}
                customUrl={customBg.url}
                onSelectBackground={(id) => selectBackground(id)}
                onUpload={uploadBackground}
                onRemoveCustom={removeCustomBackground}
                theme={settings.theme}
                onTheme={(theme: ThemePref) => setSettings({ theme, themeLocked: true })}
                glass={settings.glass}
                onGlass={(glass) => setSettings({ glass })}
                cardGlass={settings.cardGlass}
                onCardGlass={(cardGlass) => setSettings({ cardGlass })}
                account={account}
              />
            </div>
          )}

          {view === 'categories' && (
            <div className="mx-auto max-w-2xl">
              <CategoriesView
                categories={categories}
                counts={counts}
                onCreate={cats.add}
                onUpdate={cats.update}
                onDelete={handleDeleteCategory}
              />
            </div>
          )}
        </main>

        <aside
          aria-label="Resumen"
          className="flex flex-col gap-4 px-4 pb-28 sm:px-6 lg:h-full lg:overflow-y-auto lg:px-0 lg:pt-12 lg:pr-6 lg:pb-8"
        >
          <ProgressCard done={doneThisWeek} pending={pending.length} lastWeek={doneLastWeek} onOpen={() => setCompletedOpen(true)} />
          {view !== 'calendar' && <MiniCalendar now={now} selected={selectedDay} onSelect={setSelectedDay} marks={dayMarks} />}
          <DayAgenda
            ref={agendaInputRef}
            dayKey={selectedDay}
            now={now}
            tasks={dayItems.get(selectedDay)?.tasks ?? []}
            overdue={overdue}
            reminders={dayItems.get(selectedDay)?.reminders ?? []}
            onCompleteTask={handleComplete}
            onOpenTask={openTask}
            onAddReminder={(title, time) => rem.add(title, selectedDay, time)}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        </aside>
      </div>
      </div>

      <CompletedDrawer
        open={completedOpen}
        onClose={() => setCompletedOpen(false)}
        completed={completed}
        now={now}
        onReopen={handleReopen}
      />
      {backend.kind === 'cloud' && !online && (
        <div role="status" className="fixed top-3 left-1/2 z-40 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-bold shadow-lg" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          Sin conexión: los cambios no se guardarán hasta que vuelva internet
        </div>
      )}
      <HelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Toast toast={toast} onUndo={undoLast} />
      {import.meta.env.DEV && <DebugTimeTravel />} {/* PRUEBA */}
    </div>
  );
}
