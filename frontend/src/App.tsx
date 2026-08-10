import { Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/ui/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { ExerciseBrowser } from './pages/ExerciseBrowser'
import { ExerciseDetail } from './pages/ExerciseDetail'
import { WorkoutSession } from './pages/WorkoutSession'

export default function App() {
  return (
    <div className="flex-1 pb-20">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ejercicios" element={<ExerciseBrowser />} />
        <Route path="/ejercicios/:id" element={<ExerciseDetail />} />
        <Route path="/sesion" element={<WorkoutSession />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
