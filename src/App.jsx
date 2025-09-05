import { useState, useEffect } from "react";
import "./style.css";

export default function App() {
  const [mainTasks, setMainTasks] = useState(() => JSON.parse(localStorage.getItem("mainTasks")) || []);
  const [tempTasks, setTempTasks] = useState(() => JSON.parse(localStorage.getItem("tempTasks")) || []);
  const [habits, setHabits] = useState(() =>
    JSON.parse(localStorage.getItem("habits")) || {
      hpt: false,
      mpt: false,
      lpt: false,
      mr: false,
      er: false,
      nr: false,
    }
  );

  const [taskInput, setTaskInput] = useState("");
  const [taskType, setTaskType] = useState("HPT");
  const [tempInput, setTempInput] = useState("");

  useEffect(() => localStorage.setItem("mainTasks", JSON.stringify(mainTasks)), [mainTasks]);
  useEffect(() => localStorage.setItem("tempTasks", JSON.stringify(tempTasks)), [tempTasks]);
  useEffect(() => localStorage.setItem("habits", JSON.stringify(habits)), [habits]);

  const weights = { HPT: 1, MPT: 0.8, LPT: 0.6 };
  const tempWeight = 0.2;

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const clearScore=()=>{
    setMainTasks([]);
    setTempTasks([]);
  }

  const addMainTask = () => {
    if (!taskInput.trim()) return;
    const newTask = {
      id: generateId(),
      text: taskInput.trim(),
      type: taskType,
      completed: false,
    };
    setMainTasks([...mainTasks, newTask]);
    setTaskInput("");
  };

  const addTempTask = () => {
    if (!tempInput.trim()) return;
    const newTask = {
      id: generateId(),
      text: tempInput.trim(),
      completed: false,
    };
    setTempTasks([...tempTasks, newTask]);
    setTempInput("");
  };

  const toggleComplete = (id, section) => {
    const tasks = section === "main" ? mainTasks : tempTasks;
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: true } : task
    );
    section === "main" ? setMainTasks(updatedTasks) : setTempTasks(updatedTasks);
  };

  const deleteTask = (id, section) => {
    const tasks = section === "main" ? mainTasks : tempTasks;
    const updatedTasks = tasks.filter((task) => task.id !== id);
    section === "main" ? setMainTasks(updatedTasks) : setTempTasks(updatedTasks);
  };

  const toggleHabit = (key) => setHabits({ ...habits, [key]: !habits[key] });

  const mainScore = mainTasks.reduce((sum, t) => (t.completed ? sum + (weights[t.type] || 0) : sum), 0);
  const tempScore = tempTasks.reduce((sum, t) => (t.completed ? sum + tempWeight : sum), 0);

  const renderUncompletedTasks = (tasks, section) => {
    const uncompletedTasks = tasks.filter((task) => !task.completed);
    if (uncompletedTasks.length === 0) return <li>No active tasks</li>;

    return uncompletedTasks.map((task) => (
      <li key={task.id}>
        <div className="circle-checkbox" onClick={() => toggleComplete(task.id, section)}></div>
        <span>{task.text} {section === "main" && `(${task.type})`}</span>
        <button className="del-btn" onClick={() => deleteTask(task.id, section)}>×</button>
      </li>
    ));
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Execution Board</h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(mainScore + tempScore) * 10}%` }}></div>
        </div>
        <p className="score">Main: {mainScore.toFixed(1)} | Temp: {tempScore.toFixed(1)}</p>
      </div>

      {/* Execution Focus Section */}
      <div className="focus-banner">
        <h2>🎯 Today’s Focus</h2>
        <p>{tempTasks.find(t => !t.completed)?.text || "No temp task yet"}</p>
      </div>

      <div className="two-columns">
        {/* Left Column: Main Tasks */}
        <div className="left-section">
          <h2>Main Tasks</h2>
          <div className="input-section">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Add main task"
            />
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              <option value="HPT">HPT</option>
              <option value="MPT">MPT</option>
              <option value="LPT">LPT</option>
            </select>
            <button onClick={addMainTask}>Add</button>
          </div>
          <ul>{renderUncompletedTasks(mainTasks, "main")}</ul>
        </div>

        {/* Right Column: Temp Tasks */}
        <div className="right-section">
          <h2>Temporary Aims</h2>
          <div className="input-section">
            <input
              type="text"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              placeholder="Add temporary target"
            />
            <button onClick={addTempTask}>Add</button>
          </div>
          <ul>{renderUncompletedTasks(tempTasks, "temp")}</ul>
        </div>
      </div>

      {/* Habits Section */}
      <div className="habits">
        <h2>Daily Habits</h2>
        <ul className="habit-list">
          {Object.keys(habits).map((key) => (
            <li key={key}>
              <div
                className={`circle-checkbox ${habits[key] ? "checked" : ""}`}
                onClick={() => toggleHabit(key)}
              ></div>
              <span className={habits[key] ? "strike" : ""}>{key.toUpperCase()}</span>
            </li>
          ))}
        </ul>
        <button onClick={clearScore}>End of the day</button>
      </div>
    </div>
  );
}
