'use client'
import { useEffect, useState } from 'react';
import TaskTable from './taskTable';

export default function FilterableTaskTable() {
  // state is what the data is representing in realtime
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/tasks')
      .then((res) => res.json())
      .then((data) => {
        console.log('Can you see data?', data)
        // data is an object
        setData(data);
        setLoading(false);
      })
  }, []);

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No data shown...</p>

  return (
    <main>
      <TaskTable tasks={data.tasks} />
    </main>
  )
}