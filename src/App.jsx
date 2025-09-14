import { Routes, Route } from 'react-router-dom'
import Chatbot from "./pages/Chatbot"
import Auth from "./pages/Auth"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Routes>
  <Route path="/" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
      <Route path="/auth" element={<Auth />} /> 
    </Routes>
  )
}

export default App
