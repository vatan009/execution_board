import { useState, useEffect } from "react";
import "./style.css";

export default function App() {
  const [mainTasks, setMainTasks] = useState(() => JSON.parse(localStorage.getItem("mainTasks")) || []);
  const [tempTasks, setTempTasks] = useState(() => JSON.parse(localStorage.getItem("tempTasks")) || []);
  const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem("habits")) || {
    hpt: false, mpt: false, lpt: false, mr: false, er: false, nr: false
  });

  const [taskInput, setTaskInput] = useState("");
  const [taskType, setTaskType] = useState("HPT");
  const [tempInput, setTempInput] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [mainIndex, setMainIndex] = useState(0);
  const [tempIndex, setTempIndex] = useState(0);

  useEffect(() => localStorage.setItem("mainTasks", JSON.stringify(mainTasks)), [mainTasks]);
  useEffect(() => localStorage.setItem("tempTasks", JSON.stringify(tempTasks)), [tempTasks]);
  useEffect(() => localStorage.setItem("habits", JSON.stringify(habits)), [habits]);

  const weights = { HPT: 1, MPT: 0.8, LPT: 0.6 };
  const tempWeight = 0.2;

  const addMainTask = () => {
    if (!taskInput.trim()) return;
    setMainTasks([...mainTasks, { text: taskInput.trim(), type: taskType, completed: false }]);
    setTaskInput("");
  };

  const addTempTask = () => {
    if (!tempInput.trim()) return;
    setTempTasks([...tempTasks, { text: tempInput.trim(), completed: false }]);
    setTempInput("");
  };

  const toggleComplete = (index, section) => {
    const tasks = section === "main" ? [...mainTasks] : [...tempTasks];
    tasks[index].completed = !tasks[index].completed;
    section === "main" ? setMainTasks(tasks) : setTempTasks(tasks);
  };

  const deleteTask = (index, section) => {
    const tasks = section === "main" ? [...mainTasks] : [...tempTasks];
    tasks.splice(index, 1);
    section === "main" ? setMainTasks(tasks) : setTempTasks(tasks);
    if (section === "main" && mainIndex >= tasks.length) setMainIndex(Math.max(0, tasks.length - 1));
    if (section === "temp" && tempIndex >= tasks.length) setTempIndex(Math.max(0, tasks.length - 1));
  };

  const toggleHabit = (key) => setHabits({ ...habits, [key]: !habits[key] });

  const mainScore = mainTasks.reduce((sum, t) => t.completed ? sum + (weights[t.type] || 0) : sum, 0);
  const tempScore = tempTasks.reduce((sum, t) => t.completed ? sum + tempWeight : sum, 0);

  const renderSingleTask = (tasks, index, section) => {
    if (tasks.length === 0) return <li>No tasks</li>;
    const task = tasks[index];
    if (!showCompleted && task.completed) return <li>Completed task hidden</li>;

    return (
      <li className={task.completed ? "completed" : ""}>
        <div className={`circle-checkbox ${task.completed ? "checked" : ""}`} onClick={() => toggleComplete(index, section)}></div>
        <span className={task.completed ? "strike" : ""}>
          {task.text} {section === "main" && `(${task.type})`}
        </span>
        <button className="del-btn" onClick={() => deleteTask(index, section)}>×</button>
      </li>
    );
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
        <p>{tempTasks[tempIndex]?.text || "No temp task yet"}</p>
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
          <ul>{renderSingleTask(mainTasks, mainIndex, "main")}</ul>
          {mainTasks.length > 1 && (
            <button onClick={() => setMainIndex((mainIndex + 1) % mainTasks.length)}>Next Main</button>
          )}
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
          <ul>{renderSingleTask(tempTasks, tempIndex, "temp")}</ul>
          {tempTasks.length > 1 && (
            <button onClick={() => setTempIndex((tempIndex + 1) % tempTasks.length)}>Next Temp</button>
          )}
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
      </div>

      <button className="toggle-show" onClick={() => setShowCompleted(!showCompleted)}>
        {showCompleted ? "Hide Completed" : "Show Completed"}
      </button>
    </div>
  );
}
