import {useState, useEffect, ChangeEvent} from 'react'

type Task = {
  name: string
  timeLeft: number
}

export default function ReminderApp() {

  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [taskTime, setTaskTime] = useState<string | ''>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    setNewTask(event.target.value);
  }

  function handleTimeChange(event: ChangeEvent<HTMLInputElement>) {
    setTaskTime(event.target.value)
  }

  function addTask() {
    const timeInMinutes = Number(taskTime)
    if (newTask.trim() !== "" && timeInMinutes !== 0) {
      setTasks([...tasks, { name: newTask, timeLeft: timeInMinutes * 60 }]);
      setNewTask("");
      setTaskTime("");
      setErrorMsg(null);
    } else {
      setErrorMsg(
        "Reminder Name and Task Time must not be empty Or have the same Name."
      );
    }
  }

  function deleteTask(index: number) {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTasks((prevTask) =>
        prevTask.map((task) =>
          task.timeLeft > 0 ? {...task, timeLeft: task.timeLeft - 1} : task
        )
      )
    }, 1000);
    return () => clearInterval(intervalId)
  })

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`
  }

  return(
    <div>
      <h1>Reminder App</h1>
      <input onChange={handleInputChange} type="text" placeholder='Task name...' />
      <input onChange={handleTimeChange} type="number" placeholder='Time : (Minutes)' min='1' />
      <button onClick={addTask}>Add</button>
      {errorMsg && <div>{errorMsg}</div>}
      {tasks.map((task, index) => (
        <div key={index}>
          <p>{task.name}</p>
          <p>Time left: {formatTime(task.timeLeft)}</p>
          <button onClick={() => deleteTask(index)}>Delete</button>
        </div>
      ))}
    </div>
  )
}