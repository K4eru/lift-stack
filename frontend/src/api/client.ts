import type { Exercise, Profile, Template, Workout, WorkoutSet } from './types'

const API_BASE = ''

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

export const exercises = {
  list: () => fetchJSON<Exercise[]>(`${API_BASE}/exercises`),
  get: (id: string) => fetchJSON<Exercise>(`${API_BASE}/exercises/${id}`),
}

export const profiles = {
  list: () => fetchJSON<Profile[]>(`${API_BASE}/profiles`),
  create: (name: string) =>
    fetchJSON<Profile>(`${API_BASE}/profiles`, { method: 'POST', body: JSON.stringify({ name }) }),
  get: (id: string) => fetchJSON<Profile>(`${API_BASE}/profiles/${id}`),
}

export const workouts = {
  list: (profileId?: string) =>
    fetchJSON<Workout[]>(`${API_BASE}/workouts${profileId ? `?profile_id=${profileId}` : ''}`),
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

export const templates = {
  list: (isSystem?: boolean) =>
    fetchJSON<Template[]>(`${API_BASE}/templates${isSystem !== undefined ? `?is_system=${isSystem}` : ''}`),
  get: (id: string) => fetchJSON<Template>(`${API_BASE}/templates/${id}`),
}
