import {useState, useEffect, ChangeEvent} from 'react'

type Task = {
  name: string
  timeLeft: number
  notified: boolean
}

export default function ReminderApp() {

  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [taskTime, setTaskTime] = useState<string | number>(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [permission, setPermission] = useState(Notification.permission)

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    setNewTask(event.target.value);
  }

  function handleTimeChange(event: ChangeEvent<HTMLInputElement>) {
    setTaskTime(event.target.value)
  }

  function addTask() {
    const timeInMinutes = Number(taskTime)
    if (newTask.trim() !== "" && timeInMinutes !== 0) {
      setTasks([...tasks, { name: newTask,
         timeLeft: timeInMinutes * 60, 
         notified: false}]);
      setNewTask("");
      setTaskTime(1);
      setErrorMsg(null);
    } else {
      setErrorMsg(
        "Reminder Name and Task Time must not be empty."
      );
    }
  }

  function deleteTask(index: number) {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const storedTask = window.localStorage.getItem('tasks')

    if (storedTask) {
      if (storedTask !== null) setTasks(JSON.parse(storedTask))
    }
  },[])

  useEffect(() => {
    if ('Notification' in window) {
      console.log('notification supported')
    }else {
      console.log('notification not supported')
    }

    if (permission !== 'granted') {
      Notification.requestPermission().then((res) => {
        setPermission(res)
      })
    }
  }, [permission])

  useEffect(() => {

    localStorage.setItem('tasks', JSON.stringify(tasks))

    const intervalId = setInterval(() => {
      setTasks((prevTask) =>
        prevTask.map((task) => {
          if (task.timeLeft > 0) {
            const updatedTask = {...task, timeLeft: task.timeLeft - 1}
            if (updatedTask.timeLeft === 59 && !task.notified) {
              console.log('creating noti for task')
              if (permission === 'granted') {
                new Notification(`${task.name} is due!!!`);
                return {...updatedTask, notified: true}
              }
            }
              return updatedTask
            }
              return task
        })
      )
    }, 1000);
    return () => clearInterval(intervalId)
  }, )

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`
  }

  function hadleKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) {
    if (event.key === 'Enter') {
      addTask()
    }
  }

  return (
    <div className='reminder-app'>
      <div className="app-container">
      <h1 className='header gradient-text'>Reminder App</h1>
      <div className="input-container">
        <input
          onChange={handleInputChange}
          onKeyDown={hadleKeyDown}
          type="text"
          placeholder="Task name..."
          value={newTask}
          autoFocus
        />
        <input
          onChange={handleTimeChange}
          onKeyDown={hadleKeyDown}
          type="number"
          placeholder="Time : (Minutes)"
          min="1"
          value={taskTime}
        />
        <button onClick={addTask} onKeyDown={hadleKeyDown}>
          Add
        </button>
      </div>
      {errorMsg && <div className='error'>{errorMsg}</div>}
      {tasks.length > 0 && (
      <div className="task-container">
        {tasks.map((task, index) => (
          <div key={index} className="task">
            <p>{task.name}</p>
            <p className={task.timeLeft > 1 ? "time-green" : "time-red"}>
              Time left: {formatTime(task.timeLeft)}
            </p>
            <button onClick={() => deleteTask(index)}>Delete</button>
          </div>
        ))}
      </div>
      )}
      </div>
    </div>
  );
}