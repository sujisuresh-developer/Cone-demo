import { useState, useEffect } from 'react'
import { NotebookPen, X, Trash2, Check } from 'lucide-react'

type NotepadModalProps = {
  open: boolean
  onClose: () => void
}

const TEMPLATES = [
  { label: '+ Assessment', text: '• Assessment:\n' },
  { label: '+ Physical Findings', text: '• Physical Findings:\n' },
  { label: '+ Vitals Note', text: '• Vitals Note:\n' },
  { label: '+ Differential Dx', text: '• Differential Dx:\n' },
]

export default function NotepadModal({ open, onClose }: NotepadModalProps) {
  const [visible, setVisible] = useState(open)
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('simulation_observation_notes') || ''
  })
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    localStorage.setItem('simulation_observation_notes', notes)
  }, [notes])

  if (!open && !visible) return null

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0
  const charCount = notes.length

  const handleInsertTemplate = (templateText: string) => {
    setNotes((prev) => (prev ? `${prev}\n${templateText}` : templateText))
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your observation notes?')) {
      setNotes('')
    }
  }

  const handleSaveAndClose = () => {
    localStorage.setItem('simulation_observation_notes', notes)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        open ? 'bg-black/40 backdrop-blur-xs opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`card-shadow relative w-full max-w-xl rounded-3xl bg-white p-6 transition-all duration-300 ${
          open ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <NotebookPen className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-800 leading-tight">Observation Notes</h2>
              <p className="text-[11px] text-gray-500">Record clinical findings, observations & differential diagnosis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Insert Templates */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => handleInsertTemplate(tmpl.text)}
              className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
            >
              {tmpl.label}
            </button>
          ))}
        </div>

        {/* Notepad Textarea */}
        <div className="relative mb-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type your clinical observation notes here... (e.g. Patient presents with sudden-onset pleuritic chest pain. Reduced right lung breath sounds...)"
            rows={9}
            className="w-full rounded-2xl bg-gray-50 p-4 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-primary/30 focus:shadow-sm resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Footer info & actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>

          <div className="flex items-center gap-2">
            {notes && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-[12px] font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveAndClose}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white shadow-md transition-all cursor-pointer ${
                savedSuccess ? 'bg-green-600' : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              <Check className="h-4 w-4" />
              {savedSuccess ? 'Saved!' : 'Save & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
