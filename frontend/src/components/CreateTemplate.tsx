import { useState, useEffect } from 'react'
import { templates, exercises } from '../api/client'
import type { Exercise } from '../api/types'

interface Props {
  onDone: () => void
}

export function CreateTemplate({ onDone }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [exerciseList, setExerciseList] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    exercises.list().then(setExerciseList)
  }, [])

  const filtered = exerciseList.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = (exerciseId: string) => {
    if (!selectedExercises.includes(exerciseId)) {
      setSelectedExercises([...selectedExercises, exerciseId])
    }
  }

  const handleRemove = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((id) => id !== exerciseId))
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    await templates.create({
      name,
      description: description || undefined,
      exercises: selectedExercises.map((id) => ({
        exercise_id: id,
        target_sets: 3,
        target_reps: 10,
      })),
    })
    onDone()
  }

  return (
    <div className="p-4">
      <button
        className="bg-bg-secondary hover:bg-bg-tertiary px-4 py-2 rounded-lg text-sm text-text-secondary transition-colors mb-4"
        onClick={onDone}
      >
        &larr; Cancel
      </button>

      <h2 className="text-2xl font-bold mb-4">Create Template</h2>

      <input
        type="text"
        placeholder="Template name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2 text-sm mb-2"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2 text-sm mb-4"
      />

      <h3 className="text-lg font-semibold mb-2">
        Selected Exercises ({selectedExercises.length})
      </h3>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4">
        {selectedExercises.map((id) => {
          const ex = exerciseList.find((e) => e.id === id)
          return ex ? (
            <div
              key={id}
              className="bg-bg-secondary p-3 rounded-xl flex items-center justify-between"
            >
              <span className="text-sm">{ex.name}</span>
              <button
                className="bg-bg-tertiary hover:bg-red-600 w-8 h-8 rounded-lg text-text-secondary transition-colors"
                onClick={() => handleRemove(id)}
              >
                &times;
              </button>
            </div>
          ) : null
        })}
      </div>

      <h3 className="text-lg font-semibold mb-2">Add Exercises</h3>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-2 text-sm mb-2"
      />
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {filtered.slice(0, 20).map((ex) => (
          <div
            key={ex.id}
            className="bg-bg-secondary p-3 rounded-xl flex items-center justify-between"
          >
            <span className="text-sm">{ex.name}</span>
            <button
              className="bg-blue-600 hover:bg-blue-700 w-8 h-8 rounded-lg transition-colors"
              onClick={() => handleAdd(ex.id)}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium mt-6 transition-colors disabled:opacity-50"
        onClick={handleCreate}
        disabled={!name.trim()}
      >
        Create Template
      </button>
    </div>
  )
}
