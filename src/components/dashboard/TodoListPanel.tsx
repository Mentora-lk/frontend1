'use client';

import { useState, useEffect, useCallback } from 'react';
import { tutorService, TodoItem } from '@/services/tutorService';
import { usePalette } from '@/hooks/usePalette';

const formatFinishTime = (iso: string | null) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// Auto-calculated countdown/overdue text — replaces the old manually-entered
// "how much time to finish" field. Recomputed against `now`, which ticks
// forward on an interval so this stays live without a page refresh.
const formatTimeRemaining = (iso: string | null, now: number): { text: string; overdue: boolean } | null => {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - now;
  const overdue = diffMs < 0;
  const totalMinutes = Math.floor(Math.abs(diffMs) / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const text = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { text, overdue };
};

// "To Do List" tab on the Profile page — a tutor's own personal task list
// (what to do, when it's due, how long it'll take). Self-contained, fetches
// its own data, same pattern as RevenueAnalyticsPanel.
export default function TodoListPanel() {
  const palette = usePalette();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [task, setTask] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Ticks forward so "time remaining" recomputes live without a page refresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await tutorService.getTodos();
      setTodos(result);
      setError('');
    } catch (err) {
      console.error('Failed to fetch to-do list', err);
      setError('Failed to load your to-do list. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const resetForm = () => {
    setTask('');
    setFinishTime('');
    setFormError('');
  };

  const submitTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      setFormError('Enter what you need to do.');
      return;
    }

    setAdding(true);
    setFormError('');
    try {
      await tutorService.addTodo({
        task: task.trim(),
        finishTime: finishTime || undefined,
      });
      resetForm();
      await fetchTodos();
    } catch (err) {
      console.error('Failed to add task', err);
      setFormError('Failed to save. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (item: TodoItem) => {
    setBusyId(item.id);
    try {
      const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
      await tutorService.updateTodoStatus(item.id, nextStatus);
      await fetchTodos();
    } catch (err) {
      console.error('Failed to update task', err);
      alert('Failed to update. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const removeTodo = async (id: number) => {
    if (!window.confirm('Delete this task?')) return;
    setBusyId(id);
    try {
      await tutorService.deleteTodo(id);
      await fetchTodos();
    } catch (err) {
      console.error('Failed to delete task', err);
      alert('Failed to delete. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = todos.filter(t => t.status === 'pending').length;
  const completedCount = todos.filter(t => t.status === 'completed').length;

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        .fade-up{animation:fadeUp 0.6s cubic-bezier(.22,1,.36,1) both;}
        .todo-input{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid ${palette.border};background:${palette.inputBg};color:${palette.textPrimary};font-size:13px;font-family:'DM Sans',sans-serif;outline:none;}
        .todo-row{transition:background 0.15s ease;}
        .todo-row:hover{background:${palette.surfaceAlt};}
      `}</style>

      {/* ── SUMMARY ── */}
      <div className="fade-up" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Pending', v: pendingCount, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
          { label: 'Completed', v: completedCount, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
        ].map((s, i) => (
          <div key={i} style={{ background: palette.surface, borderRadius: 16, padding: '16px 20px', border: `1px solid ${s.border}`, flex: 1, minWidth: 120 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: s.color }}>{s.v}</div>
            <div style={{ fontSize: 12, color: palette.textSecondary, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── ADD TASK ── */}
        <div className="fade-up" style={{ flex: 1, minWidth: 260, background: palette.surface, borderRadius: 20, padding: 22, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: palette.textPrimary, marginBottom: 16 }}>Add Task</h3>
          <form onSubmit={submitTodo} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>What I Do</label>
              <input type="text" className="todo-input" value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Prepare A/L Physics slides" maxLength={255} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Finish Time</label>
              <input type="datetime-local" className="todo-input" value={finishTime} onChange={e => setFinishTime(e.target.value)} />
            </div>
            {formError && <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{formError}</p>}
            <button type="submit" disabled={adding}
              style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', fontSize: 13, fontWeight: 700, cursor: adding ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: adding ? 0.7 : 1 }}>
              {adding ? 'Adding...' : '+ Add Task'}
            </button>
          </form>
        </div>

        {/* ── TASK LIST ── */}
        <div className="fade-up" style={{ flex: 2, minWidth: 320, background: palette.surface, borderRadius: 20, padding: 24, boxShadow: palette.shadow, border: `1px solid ${palette.border}` }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: palette.textPrimary, marginBottom: 4 }}>My Tasks</h3>
          <p style={{ fontSize: 12, color: palette.textMuted, marginBottom: 20 }}>Your personal to-do list — not visible to students</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: palette.textMuted }}>Loading...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: palette.textMuted }}>{error}</div>
          ) : todos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: palette.textMuted }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Nothing on your list yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Use "Add Task" to note down what you need to do</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {todos.map(t => {
                const remaining = t.status === 'pending' ? formatTimeRemaining(t.finishTime, now) : null;
                const finish = formatFinishTime(t.finishTime);
                return (
                  <div key={t.id} className="todo-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 10px', borderRadius: 12, borderBottom: `1px solid ${palette.border}` }}>
                    <button onClick={() => toggleStatus(t)} disabled={busyId === t.id}
                      title={t.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                      style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 2, cursor: busyId === t.id ? 'default' : 'pointer',
                        border: `2px solid ${t.status === 'completed' ? '#10B981' : palette.border}`,
                        background: t.status === 'completed' ? '#10B981' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}>
                      {t.status === 'completed' && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 14, fontWeight: 600, color: t.status === 'completed' ? palette.textMuted : palette.textPrimary,
                        textDecoration: t.status === 'completed' ? 'line-through' : 'none', marginBottom: 4,
                      }}>
                        {t.task}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11, color: palette.textMuted }}>
                        {finish && (
                          <span style={{ color: remaining?.overdue ? '#EF4444' : palette.textMuted, fontWeight: remaining?.overdue ? 700 : 400 }}>
                            🕐 {finish}
                          </span>
                        )}
                        {remaining && (
                          <span style={{ color: remaining.overdue ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                            ⏳ {remaining.overdue ? `Overdue by ${remaining.text}` : `${remaining.text} left`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => removeTodo(t.id)} disabled={busyId === t.id}
                      style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: 'none', borderRadius: 7, padding: '5px 12px', cursor: busyId === t.id ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: busyId === t.id ? 0.6 : 1, flexShrink: 0 }}>
                      {busyId === t.id ? '...' : 'Delete'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
