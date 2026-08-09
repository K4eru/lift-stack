import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'

function App() {
  return <div className="p-4 text-foreground">lift-stack</div>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
