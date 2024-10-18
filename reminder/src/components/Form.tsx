import {useState, useEffect, ChangeEvent, useRef} from 'react'

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
  const isFirstRender = useRef(true)

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

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    console.log('useEffect trigger')

    if ('Notification' in window) {
      console.log(`notifications supported`)
    }else {
      console.log('not supported')
    }

    if (permission !== 'granted') {
      Notification.requestPermission().then((result) => {
        setPermission(result)
      })
    }

    const intervalId = setInterval(() => {
      setTasks((prevTask) =>
        prevTask.map((task) => {
          if (task.timeLeft === 59 && !task.notified && permission === 'granted') {
            console.log('creating noti for task')
            new Notification(`${task.name} is due!!!`)
          return {...task, timeLeft: task.timeLeft - 1, notified: true}
          }else if (task.timeLeft > 0) {            
            return {...task, timeLeft: task.timeLeft - 1}
          }
          return task
        })
      )
    }, 1000);
    console.log('clearing interval')
    return () => clearInterval(intervalId)
  }, [permission])

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

  return(
    <div>
      <h1>Reminder App</h1>
      <input onChange={handleInputChange} onKeyDown={hadleKeyDown} type="text" placeholder='Task name...' value={newTask} autoFocus />
      <input onChange={handleTimeChange} onKeyDown={hadleKeyDown} type="number" placeholder='Time : (Minutes)' min='1' value={taskTime} />
      <button onClick={addTask} onKeyDown={hadleKeyDown}>Add</button>
      {errorMsg && <div>{errorMsg}</div>}
      <div className='task-container'>
        {tasks.map((task, index) => (
          <div key={index} className='task'>
            <p>{task.name}</p>
            <p>Time left: {formatTime(task.timeLeft)}</p>
            <button onClick={() => deleteTask(index)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}