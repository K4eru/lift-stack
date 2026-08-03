import type { Profile, Exercise, Template, Workout, WorkoutSet } from './types'

const API_BASE = '/api'

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

// Profiles
export const profiles = {
  list: () => fetchJSON<Profile[]>(`${API_BASE}/profiles`),
  create: (name: string) =>
    fetchJSON<Profile>(`${API_BASE}/profiles`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  get: (id: string) => fetchJSON<Profile>(`${API_BASE}/profiles/${id}`),
}

// Exercises
export const exercises = {
  list: (filters?: {
    category?: string
    equipment?: string
    target?: string
    muscle_group?: string
    search?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.equipment) params.append('equipment', filters.equipment)
    if (filters?.target) params.append('target', filters.target)
    if (filters?.muscle_group) params.append('muscle_group', filters.muscle_group)
    if (filters?.search) params.append('search', filters.search)
    return fetchJSON<Exercise[]>(`${API_BASE}/exercises?${params}`)
  },
  get: (id: string) => fetchJSON<Exercise>(`${API_BASE}/exercises/${id}`),
}

// Templates
export const templates = {
  list: (isSystem?: boolean) => {
    const params = isSystem !== undefined ? `?is_system=${isSystem}` : ''
    return fetchJSON<Template[]>(`${API_BASE}/templates${params}`)
  },
  get: (id: string) => fetchJSON<Template>(`${API_BASE}/templates/${id}`),
  create: (data: { name: string; description?: string; exercises: any[] }) =>
    fetchJSON<Template>(`${API_BASE}/templates`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Workouts
export const workouts = {
  list: (profileId?: string) => {
    const params = profileId ? `?profile_id=${profileId}` : ''
    return fetchJSON<Workout[]>(`${API_BASE}/workouts${params}`)
  },
  get: (id: string) => fetchJSON<Workout>(`${API_BASE}/workouts/${id}`),
  start: (name: string, profileId: string, templateId?: string) =>
    fetchJSON<Workout>(`${API_BASE}/workouts`, {
      method: 'POST',
      body: JSON.stringify({ name, profile_id: profileId, template_id: templateId }),
    }),
  addSet: (workoutId: string, data: {
    exercise_id: string
    set_number: number
    reps: number
    weight?: number
    duration_seconds?: number
    rest_seconds?: number
    notes?: string
  }) =>
    fetchJSON<WorkoutSet>(`${API_BASE}/workouts/${workoutId}/sets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { completed_at?: string; notes?: string }) =>
    fetchJSON<Workout>(`${API_BASE}/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}
