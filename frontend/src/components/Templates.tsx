import { useState, useEffect } from 'react'
import { templates } from '../api/client'
import type { Template } from '../api/types'
import { TemplateDetail } from './TemplateDetail'
import { CreateTemplate } from './CreateTemplate'

export function Templates() {
  const [templateList, setTemplateList] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)
  const [showSystem, setShowSystem] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    templates.list()
      .then(setTemplateList)
      .catch((err) => setError(err.message || 'Failed to load templates'))
      .finally(() => setLoading(false))
  }, [])

  if (creating) {
    return (
      <CreateTemplate
        onDone={() => {
          setCreating(false)
          templates.list().then(setTemplateList)
        }}
      />
    )
  }

  if (selectedTemplate) {
    return (
      <TemplateDetail
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    )
  }

  const filtered = templateList.filter((t) =>
    showSystem ? t.is_system : !t.is_system,
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Templates</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          onClick={() => setCreating(true)}
        >
          + Create
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showSystem ? 'bg-blue-600' : 'bg-bg-secondary hover:bg-bg-tertiary text-text-secondary'}`}
          onClick={() => setShowSystem(true)}
        >
          System
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showSystem ? 'bg-blue-600' : 'bg-bg-secondary hover:bg-bg-tertiary text-text-secondary'}`}
          onClick={() => setShowSystem(false)}
        >
          My Templates
        </button>
      </div>

      {error && <div className="text-red-500 text-center py-8">{error}</div>}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          {showSystem ? 'No system templates' : 'No custom templates yet'}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="bg-bg-secondary hover:bg-bg-tertiary p-4 rounded-xl cursor-pointer transition-colors"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="text-lg font-semibold">{template.name}</div>
            <div className="text-sm text-text-secondary">
              {template.exercises.length} exercises
            </div>
            {template.description && (
              <div className="text-sm mt-2">{template.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
