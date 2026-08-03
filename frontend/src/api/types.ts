export interface Profile {
  id: string
  name: string
  created_at: string
}

export interface Exercise {
  id: string
  name: string
  category: string
  body_part: string
  equipment: string
  target: string
  muscle_group?: string
  secondary_muscles?: string[]
  instructions?: Record<string, string>
  instruction_steps?: Record<string, string[]>
  media_id?: string
  image?: string
  gif_url?: string
}

export interface TemplateExercise {
  id: string
  exercise_id: string
  target_sets?: number
  target_reps?: number
  target_weight?: number
  order: number
  exercise: Exercise
}

export interface Template {
  id: string
  name: string
  description?: string
  is_system: boolean
  created_by?: string
  exercises: TemplateExercise[]
}

export interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  reps: number
  weight?: number
  duration_seconds?: number
  rest_seconds?: number
  notes?: string
  completed_at: string
}

export interface Workout {
  id: string
  profile_id: string
  template_id?: string
  name: string
  started_at: string
  completed_at?: string
  notes?: string
  sets: WorkoutSet[]
}
