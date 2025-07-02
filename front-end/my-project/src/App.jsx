import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './components/login'
import Home from './components/Home'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
