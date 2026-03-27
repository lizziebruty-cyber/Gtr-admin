import { useState, useEffect, useRef } from "react";

const PINK = "#ff0099";
const PALE_PINK = "#fff0f8";
const DARK = "#1a0010";
const TEAM = ["Lizzie", "Emily", "Holly"];

const SUPABASE_URL = "https://ohbceysswrkharkujsdz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oYmNleXNzd3JraGFya3Vqc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDUzMTYsImV4cCI6MjA5MDIyMTMxNn0.FHIPF1iwQuCpkSbILY_tPNBOvyQ_hRXjEARxUesej7E";

const supabase = {
  async get() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gtr_data?select=*&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    const rows = await res.json();
    return rows[0] || null;
  },
  async set(data) {
    const existing = await this.get();
    const payload = { data: JSON.stringify(data) };
    if (existing) {
      await fetch(`${SUPABASE_URL}/rest/v1/gtr_data?id=eq.${existing.id}`, {
        method: "PATCH",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/gtr_data`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(payload)
      });
    }
  }
};

const Star = ({ size = 16, color = PINK, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "TBC";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const defaultData = {
  events: [
    { id: 1, title: "Summer Social", date: "2025-07-12", status: "confirmed", owner: "Lizzie", notes: "Venue booked, need to sort payment link",
      tasks: [
        { id: 101, task: "Set up payment link", owner: "Lizzie", due: "2025-07-03", done: false },
        { id: 102, task: "Design flyer", owner: "Holly", due: "2025-07-05", done: false },
        { id: 103, task: "Send WhatsApp announcement", owner: "Emily", due: "2025-07-07", done: false },
      ]
    },
    { id: 2, title: "5K Fun Run", date: "2025-07-20", status: "planning", owner: "Emily", notes: "Route TBC",
      tasks: [
        { id: 201, task: "Confirm route", owner: "Emily", due: "2025-07-10", done: false },
        { id: 202, task: "Post on Strava", owner: "Lizzie", due: "2025-07-12", done: false },
      ]
    },
  ],
  content: [
    { id: 1, date: "2025-07-07", platform: "Instagram", caption: "Sunday run recap 🌟", status: "done", owner: "Lizzie" },
    { id: 2, date: "2025-07-09", platform: "Instagram", caption: "Merch drop teaser", status: "todo", owner: "Holly" },
    { id: 3, date: "2025-07-11", platform: "WhatsApp", caption: "Social event reminder", status: "todo", owner: "Lizzie" },
  ],
  ideas: [
    { id: 1, text: "Couch to 5K programme for beginners", addedBy: "Emily", votes: 3 },
    { id: 2, text: "GTR x local café partnership", addedBy: "Lizzie", votes: 2 },
    { id: 3, text: "Monthly mile challenge with prizes", addedBy: "Holly", votes: 4 },
  ],
  tasks: [
    { id: 3, task: "Order merch samples", owner: "Emily", due: "2025-07-10", done: true, eventId: null },
  ],
};

export default function App() {
  const [tab, setTab] = useState("tasks");
  const [data, setData] = useState(defaultData);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddEventTask, setShowAddEventTask] = useState(null);
  const [newEventTask, setNewEventTask] = useState({});
  const [filterEvent, setFilterEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const row = await supabase.get();
        if (row && row.data) setData(JSON.parse(row.data));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
    const interval = setInterval(async () => {
      try {
        const row = await supabase.get();
        if (row && row.data) setData(JSON.parse(row.data));
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showAdd) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [showAdd]);

  const save = async (newData) => {
    setSyncing(true);
    try {
      await supabase.set(newData);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) { console.error(e); }
    setSyncing(false);
  };

  const updateData = (section, newArr) => {
    const updated = { ...data, [section]: newArr };
    setData(updated);
    save(updated);
  };

  const allTasks = [
    ...data.tasks,
    ...data.events.flatMap(e => (e.tasks || []).map(t => ({ ...t, eventTitle: e.title, eventId: e.id }))),
  ];

  const toggleTask = (id, eventId) => {
    if (eventId) {
      updateData("events", data.events.map(e => e.id === eventId ? { ...e, tasks: e.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) } : e));
    } else {
      updateData("tasks", data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const deleteTask = (id, eventId) => {
    if (eventId) {
      updateData("events", data.events.map(e => e.id === eventId ? { ...e, tasks: e.tasks.filter(t => t.id !== id) } : e));
    } else {
      updateData("tasks", data.tasks.filter(t => t.id !== id));
    }
  };

  const voteIdea = (id) => updateData("ideas", data.ideas.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));

  const addItem = () => {
    if (tab === "tasks" && newItem.task) updateData("tasks", [...data.tasks, { id: Date.now(), task: newItem.task, owner: newItem.owner || "Lizzie", due: newItem.due || "", done: false, eventId: null }]);
    else if (tab === "events" && newItem.title) updateData("events", [...data.events, { id: Date.now(), title: newItem.title, date: newItem.date || "", status: "planning", owner: newItem.owner || "Lizzie", notes: newItem.notes || "", tasks: [] }]);
    else if (tab === "content" && newItem.caption) updateData("content", [...data.content, { id: Date.now(), date: newItem.date || "", platform: newItem.platform || "Instagram", caption: newItem.caption, status: "todo", owner: newItem.owner || "Lizzie" }]);
    else if (tab === "ideas" && newItem.text) updateData("ideas", [...data.ideas, { id: Date.now(), text: newItem.text, addedBy: newItem.addedBy || "Lizzie", votes: 0 }]);
    else return;
    setNewItem({});
    setShowAdd(false);
  };

  const addEventTask = (eventId) => {
    if (!newEventTask.task) return;
    updateData("events", data.events.map(e => e.id === eventId ? { ...e, tasks: [...(e.tasks || []), { id: Date.now(), task: newEventTask.task, owner: newEventTask.owner || "Lizzie", due: newEventTask.due || "", done: false }] } : e));
    setNewEventTask({});
    setShowAddEventTask(null);
  };

  const deleteItem = (section, id) => updateData(section, data[section].filter(i => i.id !== id));
  const goToEventTasks = (eventId) => { setFilterEvent(eventId); setTab("tasks"); };

  const STATUS_COLORS = {
    confirmed: { background: "#e8fff5", color: "#00aa66" },
    planning: { background: "#fff8e0", color: "#cc8800" },
    done: { background: "#e8fff5", color: "#00aa66" },
    todo: { background: PALE_PINK, color: PINK },
  };

  const pendingTasks = allTasks.filter(t => !t.done).length;
  const todoContent = data.content.filter(c => c.status === "todo").length;
  const visibleTasks = filterEvent ? allTasks.filter(t => t.eventId === filterEvent) : allTasks;
  const filteredEventName = filterEvent ? data.events.find(e => e.id === filterEvent)?.title : null;

  const inputStyle = { width: "100%", padding: "13px 14px", border: "2px solid #ffb3e0", borderRadius: 10, fontSize: 16, outline: "none", background: "white", color: DARK, fontFamily: "'DM Sans', sans-serif", WebkitAppearance: "none" };

  const Field = ({ label, children }) => (
    <div>
      {label && <p style={{ fontSize: 11, color: "#cc0077", fontWeight: 600, marginBottom: 4 }}>{label}</p>}
      {children}
    </div>
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", background: PALE_PINK, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ background: PINK, borderRadius: 16, padding: "12px 20px" }}>
        <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 24, color: "white", letterSpacing: 3 }}>GTR</span>
      </div>
      <p style={{ color: PINK, fontSize: 14, fontWeight: 600 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: PALE_PINK, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Black+Han+Sans&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .card { background: white; border-radius: 16px; padding: 14px 16px; margin-bottom: 10px; box-shadow: 0 2px 10px #ff009910; }
        .tab-btn { flex: 1; padding: 10px 2px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 700; cursor: pointer; color: #cc0077; letter-spacing: 0.03em; text-transform: uppercase; border-top: 3px solid transparent; }
        .tab-btn.active { color: ${PINK}; border-top: 3px solid ${PINK}; background: white; }
        .pink-btn { background: ${PINK}; color: white; border: none; padding: 14px 20px; border-radius: 50px; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 16px; cursor: pointer; width: 100%; }
        .sm-btn { background: ${PALE_PINK}; color: ${PINK}; border: 1.5px solid #ffb3e0; padding: 7px 14px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; }
        .task-done { text-decoration: line-through; opacity: 0.4; }
        .badge { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; }
        .del-btn { background: none; border: none; color: #ffb3e0; font-size: 20px; cursor: pointer; padding: 4px 6px; line-height: 1; flex-shrink: 0; }
        .vote-btn { background: ${PALE_PINK}; border: 2px solid #ffb3e0; color: ${PINK}; font-weight: 700; font-size: 13px; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; flex-shrink: 0; }
        .owner-tag { display: inline-block; background: ${PALE_PINK}; color: #cc0077; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 8px; white-space: nowrap; }
        .event-task { display: flex; align-items: center; gap: 8px; padding: 9px 0; border-bottom: 1px solid #ffb3e022; }
        .event-task:last-child { border-bottom: none; }
        .checkbox { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #ffb3e0; background: white; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .checkbox.checked { background: ${PINK}; border-color: ${PINK}; }
        .tasks-link { background: none; border: 1.5px solid #ffb3e0; color: ${PINK}; padding: 6px 12px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 11px; cursor: pointer; white-space: nowrap; }
        .fade-in { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: PINK, padding: "44px 16px 18px", position: "relative", overflow: "hidden" }}>
        <Star size={60} color="#ffffff15" style={{ position: "absolute", top: -10, right: -10 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "white", borderRadius: 10, padding: "5px 10px", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Black Han Sans', sans-serif", fontSize: 16, color: PINK, letterSpacing: 2 }}>GTR</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "white", fontWeight: 700, fontSize: 14 }}>Admin Hub</p>
            <p style={{ color: "#ffb3e0", fontSize: 11 }}>Girls That Run Winchester</p>
          </div>
          {syncing && <div style={{ width: 16, height: 16, border: "2px solid #ffffff44", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[{ label: "Open tasks", value: pendingTasks }, { label: "Events", value: data.events.length }, { label: "Posts due", value: todoContent }, { label: "Ideas", value: data.ideas.length }].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#ffffff18", borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
              <p style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{s.value}</p>
              <p style={{ color: "#ffb3e0", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 12px 120px" }}>

        {tab === "tasks" && (
          <div className="fade-in">
            {filterEvent && (
              <div style={{ background: "white", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1.5px solid #ffb3e0" }}>
                <p style={{ fontSize: 12, color: PINK, fontWeight: 600 }}>📅 {filteredEventName}</p>
                <button className="sm-btn" onClick={() => setFilterEvent(null)}>Show all</button>
              </div>
            )}
            {!filterEvent && <p style={{ fontSize: 10, color: "#cc0077", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>⭐ All tasks</p>}
            {visibleTasks.sort((a, b) => a.done - b.done).map(task => (
              <div key={`${task.id}-${task.eventId || "solo"}`} className="card" style={{ display: "flex", alignItems: "flex-start", gap: 10, opacity: task.done ? 0.65 : 1 }}>
                <div className={`checkbox ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id, task.eventId)}>
                  {task.done && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={task.done ? "task-done" : ""} style={{ fontWeight: 600, color: DARK, fontSize: 14 }}>{task.task}</p>
                  <div style={{ display: "flex", gap: 5, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="owner-tag">{task.owner}</span>
                    {task.due && <span style={{ fontSize: 10, color: "#bbb" }}>due {formatDate(task.due)}</span>}
                    {task.eventTitle && <span style={{ fontSize: 10, color: PINK, fontWeight: 600 }}>📅 {task.eventTitle}</span>}
                  </div>
                </div>
                <button className="del-btn" onClick={() => deleteTask(task.id, task.eventId)}>×</button>
              </div>
            ))}
            {visibleTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#ccc" }}>
                <p style={{ fontSize: 36 }}>✅</p>
                <p style={{ fontSize: 14, marginTop: 8 }}>All done!</p>
              </div>
            )}
          </div>
        )}

        {tab === "events" && (
          <div className="fade-in">
            <p style={{ fontSize: 10, color: "#cc0077", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>🗓️ Events pipeline</p>
            {data.events.map(event => {
              const doneTasks = (event.tasks || []).filter(t => t.done).length;
              const totalTasks = (event.tasks || []).length;
              return (
                <div key={event.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: DARK, fontSize: 15 }}>{event.title}</p>
                      {event.date && <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>📅 {formatDate(event.date)}</p>}
                      {event.notes && <p style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontStyle: "italic" }}>{event.notes}</p>}
                      <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span className="badge" style={STATUS_COLORS[event.status] || { background: PALE_PINK, color: PINK }}>{event.status}</span>
                        <span className="owner-tag">{event.owner}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                      <button className="tasks-link" onClick={() => goToEventTasks(event.id)}>{doneTasks}/{totalTasks} tasks</button>
                      <button className="del-btn" onClick={() => deleteItem("events", event.id)}>×</button>
                    </div>
                  </div>
                  {totalTasks > 0 && (
                    <div style={{ marginTop: 10, height: 4, background: "#ffb3e044", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(doneTasks / totalTasks) * 100}%`, background: PINK, borderRadius: 2, transition: "width 0.4s ease" }} />
                    </div>
                  )}
                  <div style={{ marginTop: 12, borderTop: `1.5px solid ${PALE_PINK}`, paddingTop: 10 }}>
                    {(event.tasks || []).length === 0 && <p style={{ fontSize: 11, color: "#ccc", fontStyle: "italic", marginBottom: 6 }}>No tasks yet</p>}
                    {(event.tasks || []).map(t => (
                      <div key={t.id} className="event-task">
                        <div className={`checkbox ${t.done ? "checked" : ""}`} onClick={() => toggleTask(t.id, event.id)}>
                          {t.done && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={t.done ? "task-done" : ""} style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{t.task}</p>
                          <div style={{ display: "flex", gap: 5, marginTop: 2, flexWrap: "wrap" }}>
                            <span className="owner-tag">{t.owner}</span>
                            {t.due && <span style={{ fontSize: 10, color: "#bbb" }}>due {formatDate(t.due)}</span>}
                          </div>
                        </div>
                        <button className="del-btn" onClick={() => deleteTask(t.id, event.id)}>×</button>
                      </div>
                    ))}
                    {showAddEventTask === event.id ? (
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                        <input style={inputStyle} placeholder="Task name" value={newEventTask.task || ""} onChange={e => setNewEventTask({ ...newEventTask, task: e.target.value })} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <select style={inputStyle} value={newEventTask.owner || "Lizzie"} onChange={e => setNewEventTask({ ...newEventTask, owner: e.target.value })}>
                            {TEAM.map(t => <option key={t}>{t}</option>)}
                          </select>
                          <input type="date" style={inputStyle} value={newEventTask.due || ""} onChange={e => setNewEventTask({ ...newEventTask, due: e.target.value })} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="pink-btn" style={{ fontSize: 14, padding: "11px" }} onClick={() => addEventTask(event.id)}>Add ⭐</button>
                          <button className="sm-btn" onClick={() => setShowAddEventTask(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="sm-btn" style={{ marginTop: 10 }} onClick={() => setShowAddEventTask(event.id)}>+ Add task</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "content" && (
          <div className="fade-in">
            <p style={{ fontSize: 10, color: "#cc0077", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>📱 Content calendar</p>
            {data.content.map(post => (
              <div key={post.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                      {post.date && <span style={{ fontSize: 10, color: "#888", fontWeight: 600 }}>{formatDate(post.date)}</span>}
                      <span style={{ background: "#fff0f8", color: PINK, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 8 }}>{post.platform}</span>
                      <span className="badge" style={STATUS_COLORS[post.status]}>{post.status}</span>
                    </div>
                    <p style={{ fontWeight: 600, color: DARK, fontSize: 13 }}>{post.caption}</p>
                    <span className="owner-tag" style={{ marginTop: 5, display: "inline-block" }}>{post.owner}</span>
                  </div>
                  <button className="del-btn" onClick={() => deleteItem("content", post.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "ideas" && (
          <div className="fade-in">
            <p style={{ fontSize: 10, color: "#cc0077", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>💡 Ideas — vote for your faves!</p>
            {[...data.ideas].sort((a, b) => b.votes - a.votes).map(idea => (
              <div key={idea.id} className="card" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: DARK, fontSize: 14 }}>{idea.text}</p>
                  <span className="owner-tag" style={{ marginTop: 4, display: "inline-block" }}>💡 {idea.addedBy}</span>
                </div>
                <button className="vote-btn" onClick={() => voteIdea(idea.id)}>▲ {idea.votes}</button>
                <button className="del-btn" onClick={() => deleteItem("ideas", idea.id)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ position: "absolute", inset: 0, background: "#00000050" }} onClick={() => setShowAdd(false)} />
          <div className="fade-in" style={{ position: "relative", background: "white", borderRadius: "24px 24px 0 0", padding: "24px 20px", paddingBottom: "env(safe-area-inset-bottom, 24px)", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, background: "#ffb3e0", borderRadius: 2, margin: "0 auto 20px" }} />
            <p style={{ fontFamily: "'Black Han Sans', sans-serif", color: PINK, fontSize: 20, marginBottom: 18 }}>
              {tab === "tasks" ? "Add task" : tab === "events" ? "Add event" : tab === "content" ? "Add post" : "Add idea"}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tab === "tasks" && <>
                <Field label="What needs doing?"><input style={inputStyle} placeholder="Task name" value={newItem.task || ""} onChange={e => setNewItem({ ...newItem, task: e.target.value })} /></Field>
                <Field label="Who's doing it?"><select style={inputStyle} value={newItem.owner || "Lizzie"} onChange={e => setNewItem({ ...newItem, owner: e.target.value })}>{TEAM.map(t => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Due date"><input type="date" style={inputStyle} value={newItem.due || ""} onChange={e => setNewItem({ ...newItem, due: e.target.value })} /></Field>
              </>}
              {tab === "events" && <>
                <Field label="Event name"><input style={inputStyle} placeholder="e.g. Summer Social" value={newItem.title || ""} onChange={e => setNewItem({ ...newItem, title: e.target.value })} /></Field>
                <Field label="Event date"><input type="date" style={inputStyle} value={newItem.date || ""} onChange={e => setNewItem({ ...newItem, date: e.target.value })} /></Field>
                <Field label="Owner"><select style={inputStyle} value={newItem.owner || "Lizzie"} onChange={e => setNewItem({ ...newItem, owner: e.target.value })}>{TEAM.map(t => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Notes (optional)"><input style={inputStyle} placeholder="Any extra info" value={newItem.notes || ""} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} /></Field>
              </>}
              {tab === "content" && <>
                <Field label="Post caption"><input style={inputStyle} placeholder="What's the post about?" value={newItem.caption || ""} onChange={e => setNewItem({ ...newItem, caption: e.target.value })} /></Field>
                <Field label="Post date"><input type="date" style={inputStyle} value={newItem.date || ""} onChange={e => setNewItem({ ...newItem, date: e.target.value })} /></Field>
                <Field label="Platform"><select style={inputStyle} value={newItem.platform || "Instagram"} onChange={e => setNewItem({ ...newItem, platform: e.target.value })}>{["Instagram", "WhatsApp", "TikTok", "Stories"].map(p => <option key={p}>{p}</option>)}</select></Field>
                <Field label="Owner"><select style={inputStyle} value={newItem.owner || "Lizzie"} onChange={e => setNewItem({ ...newItem, owner: e.target.value })}>{TEAM.map(t => <option key={t}>{t}</option>)}</select></Field>
              </>}
              {tab === "ideas" && <>
                <Field label="What's the idea?"><input style={inputStyle} placeholder="Drop it here..." value={newItem.text || ""} onChange={e => setNewItem({ ...newItem, text: e.target.value })} /></Field>
                <Field label="Added by"><select style={inputStyle} value={newItem.addedBy || "Lizzie"} onChange={e => setNewItem({ ...newItem, addedBy: e.target.value })}>{TEAM.map(t => <option key={t}>{t}</option>)}</select></Field>
              </>}
              <button className="pink-btn" onClick={addItem} style={{ marginTop: 4 }}>Add ⭐</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: `3px solid ${PINK}`, display: "flex", zIndex: 30, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {[["tasks", "✅", "Tasks"], ["events", "🗓️", "Events"], ["content", "📱", "Content"], ["ideas", "💡", "Ideas"]].map(([key, icon, label]) => (
          <button key={key} className={`tab-btn ${tab === key ? "active" : ""}`} onClick={() => { setTab(key); setShowAdd(false); if (key !== "tasks") setFilterEvent(null); }}>
            <div>{icon}</div>
            <div>{label}</div>
          </button>
        ))}
      </div>

      <button onClick={() => setShowAdd(!showAdd)} style={{ position: "fixed", bottom: 68, right: 16, background: PINK, border: "none", color: "white", width: 52, height: 52, borderRadius: "50%", fontSize: 24, cursor: "pointer", boxShadow: `0 4px 20px ${PINK}66`, zIndex: 35, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {showAdd ? "×" : "+"}
      </button>

      {saved && <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: PINK, color: "white", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 100, whiteSpace: "nowrap" }}>Saved ✓</div>}
    </div>
  );
}
