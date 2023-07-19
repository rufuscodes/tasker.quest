'use client'

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './EventsPage.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';


function EventList() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('low');
  const [newTaskLocation, setNewTaskLocation] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('work');
  const [newTaskItem, setNewTaskItem] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = () => {
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/events`)
      .then((response) => response.json())
      .then((data) => {
        setTodos(data);
      })
      .catch((error) => {
        console.error('Error fetching todos:', error);
      });
  }

  const addTask = () => {
    if (newTask.trim() === '' || !startDateTime || !endDateTime) {
      return;
    }
    const newTaskItem = {
      id: Date.now(),
      text: newTask,
      description: newTaskDescription,
      priority: newTaskPriority,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
      completed: false
    };
    setTodos([...todos, newTaskItem]);
    setNewTask('');
    setStartDateTime('');
    setEndDateTime('');
  };

  axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/users/events`, newTaskItem)
    .then((response) => {
      console.log('New todo created:', response.data);
      setNewTask('');
      setStartDateTime('');
      setEndDateTime('');
    })

  const handleDateTimeChange = (e, dateTimeType) => {
    const value = e.target.value;
    if (dateTimeType === 'start') {
      setStartDateTime(value);
    } else if (dateTimeType === 'end') {
      setEndDateTime(value);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkTasks();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const checkTasks = () => {
    const now = new Date();
    todos.forEach((task) => {
      const startDateTime = new Date(task.startDateTime);
      const endDateTime = new Date(task.endDateTime);
      if (!task.completed && startDateTime <= now && now <= endDateTime) {
        console.log(`Time's up for task: ${task.text}`);
        completeTask(task.id);
      }
    });
  };

  const completeTask = (id) => {
    setTodos(
      todos.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTodos(todos.filter((task) => task.id !== id));
  };

  const onChangeDate = (date) => {
    setSelectedDate(date);
  };

  const filteredTodos = todos.filter(
    (task) =>
      new Date(task.startDateTime).toDateString() ===
      selectedDate.toDateString()
  );

  const sortedTodos = filteredTodos.sort(
    (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
  );

  const handleTodoClick = (id) => {
    router.push(`/todo/${id}`);
  };

  return (
    <div className="TodoList">
      <h1>!EVENTS List! :</h1>
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new event!"
        />
        <div>
          <input
            type="description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Description of this cool event!"
          />
        </div>
        <div><strong>Priority:</strong></div>
        <select type="priority" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
          <option value="low">I might not go</option>
          <option value="medium">Dont want to forget</option>
          <option value="high">WOOT WOOT</option>
        </select>
        <div>
          <strong>Start Date:</strong>
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => handleDateTimeChange(e, 'start')}
            placeholder="Select start date/time"
          />
        </div>
        <div>
          <strong>End Date:</strong>
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => handleDateTimeChange(e, 'end')}
            placeholder="Select end date/time"
          />
          <div>
            <strong>Location:</strong>
            <input
              type="location"
              value={newTaskLocation}
              onChange={(e) => setNewTaskLocation(e.target.value)}
              placeholder="Enter the events location"
            />
          </div>
          <div>
            <strong>Category:</strong>
            <select type="category" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)}>
              <option value="work">Bday</option>
              <option value="school">Holiday</option>
              <option value="home">Party</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <button onClick={addTask}>Add Event</button>
      </div>
      <div>
        <h2>Calendar</h2>
        <Calendar onChange={onChangeDate} value={selectedDate} />
      </div>
      <div>
        <h2>Todos for {selectedDate.toLocaleDateString()}</h2>
        <ul>
          {sortedTodos.map((task) => (
            <Task
              key={task.id}
              task={task}
              completeTask={completeTask}
              deleteTask={deleteTask}
              handleTodoClick={handleTodoClick}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Task({ task, completeTask, deleteTask, handleTodoClick }) {
  let { id, text, startDateTime, endDateTime, completed, newTaskDescription, newTaskPriority } = task;
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [countdownActive, setCountdownActive] = useState(false);


  useEffect(() => {
    if (countdownActive) {
      const countdownInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const endTime = new Date(endDateTime).getTime();
        const remainingTime = endTime - currentTime;

        if (remainingTime <= 0) {
          clearInterval(countdownInterval);
          completeTask(id);
          return;
        }

        setTimeRemaining(formatTime(remainingTime));
      }, 1000);

      return () => {
        clearInterval(countdownInterval);
      };
    }
  }, [countdownActive, completeTask, endDateTime, id]);

  const startCountdown = () => {
    setCountdownActive(true);
  };

  const formatTime = (time) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCompleteTask = () => {
    setCountdownActive(false);
    completeTask(id);
  };

  return (
    <li>
      <span style={{ textDecoration: completed ? 'line-through' : 'none', color: completed ? 'red' : 'black' }}>
        {text}
      </span>
      <h2>Event Details</h2>
      <p>ID: {id}</p>
      <div>
        <strong>Description:</strong> {task.description}
      </div>
      <div className='priority'>
        <strong>Priority:</strong> {task.priority}
      </div>
      <div>
        <strong>Location:</strong> {task.location}
      </div>
      <div>
        <strong>Category:</strong> {task.category}
      </div>
      <div>
        <strong>Start:</strong> {new Date(startDateTime).toLocaleString()}
      </div>
      <div>
        <strong>End:</strong> {new Date(endDateTime).toLocaleString()}
      </div>
      {countdownActive ? (
        <div>Time Remaining: {timeRemaining}</div>
      ) : (
        <button onClick={startCountdown}>Start</button>
      )}
      <button onClick={handleCompleteTask}>Complete</button>
      <button onClick={() => deleteTask(id)}>Delete</button>
      <button onClick={() => handleTodoClick(task.id)}>View Details</button>
    </li>
  );
}

export default EventList;