import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Routes from './routes'

export default function App() {
  return (
    <Router>
      <Routes />
      <Toaster position="top-right" />
    </Router>
  )
}
