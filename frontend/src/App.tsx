import { useEffect, useState } from 'react'
import { fetchHello } from './api/client'

function App() {
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchHello()
      .then((data) => setMessage(data.message))
      .catch(() => setError('Failed to connect to backend'))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Hello World</h1>
      {message && <p>Backend says: <strong>{message}</strong></p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!message && !error && <p>Loading...</p>}
    </div>
  )
}

export default App
