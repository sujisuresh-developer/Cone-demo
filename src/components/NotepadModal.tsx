import { useState, useEffect } from 'react'
import { NotebookPen, X, Trash2, Check, Sparkles, Edit3, FileText, CheckCircle2 } from 'lucide-react'

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

function HighlightedNotesView({ notes }: { notes: string }) {
  if (!notes.trim()) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
        <FileText size={36} className="text-gray-300 stroke-[1.5]" />
        <p className="text-[12.5px] font-medium">No observation notes recorded yet.</p>
        <p className="text-[11px] text-gray-400">Perform actions or type in the edit canvas to generate notes.</p>
      </div>
    )
  }

  // Parse notes into sections based on bullet points or headings
  const rawSections = notes.split(/\n\s*\n/).filter((s) => s.trim().length > 0)

  return (
    <div className="space-y-3">
      {rawSections.map((section, idx) => {
        const lines = section.trim().split('\n')
        const firstLine = lines[0].trim()
        const isHeaderLine = firstLine.startsWith('•') || firstLine.includes('Professional Impression') || firstLine.endsWith(':')

        if (isHeaderLine) {
          const headerTitle = firstLine.replace(/^•\s*/, '').replace(/:\s*$/, '')
          const bodyLines = lines.slice(1).join('\n').trim()

          const isImpression = firstLine.includes('Professional Impression')

          return (
            <div
              key={idx}
              className={`rounded-2xl p-3.5 border transition-all ${
                isImpression
                  ? 'bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white border-blue-200/80 shadow-xs'
                  : 'bg-white border-gray-200/80 shadow-xs'
              }`}
            >
              {/* Highlighted Heading Badge */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold tracking-wide uppercase shadow-xs ${
                    isImpression
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  }`}
                >
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>{headerTitle}</span>
                </span>
              </div>
              {bodyLines && (
                <p className="text-[12px] leading-relaxed text-gray-700 font-medium pl-1 pt-1 whitespace-pre-wrap">
                  {bodyLines}
                </p>
              )}
            </div>
          )
        }

        return (
          <div key={idx} className="bg-white border border-gray-200/80 rounded-2xl p-3.5 shadow-xs">
            <p className="text-[12px] leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
              {section.trim()}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default function NotepadModal({ open, onClose }: NotepadModalProps) {
  const [visible, setVisible] = useState(open)
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('simulation_observation_notes') || ''
  })
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'highlighted'>('edit')

  useEffect(() => {
    if (open) {
      setVisible(true)
      setNotes(localStorage.getItem('simulation_observation_notes') || '')
    } else {
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    const handleSync = () => {
      setNotes(localStorage.getItem('simulation_observation_notes') || '')
    }
    window.addEventListener('notepad_updated', handleSync)
    return () => window.removeEventListener('notepad_updated', handleSync)
  }, [])

  useEffect(() => {
    localStorage.setItem('simulation_observation_notes', notes)
  }, [notes])

  if (!open && !visible) return null

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0
  const charCount = notes.length
  const impressionCount = (notes.match(/Professional Impression/g) || []).length

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
        className={`card-shadow relative w-full max-w-xl rounded-3xl bg-white p-6 transition-all duration-300 notepad-modal-outline-effect ${
          open ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <NotebookPen className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-bold text-gray-800 leading-tight">Observation Notes</h2>
                {impressionCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {impressionCount} {impressionCount === 1 ? 'Impression' : 'Impressions'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">Record clinical findings, action impressions & differential diagnosis</p>
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

        {/* View Mode Tabs & Quick Templates */}
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-white text-gray-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 size={13} />
              <span>Edit Notes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('highlighted')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activeTab === 'highlighted'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles size={13} />
              <span>Highlighted View</span>
            </button>
          </div>

          {/* Quick Insert Templates (Visible in Edit mode) */}
          {activeTab === 'edit' && (
            <div className="flex items-center gap-1 overflow-x-auto">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => handleInsertTemplate(tmpl.text)}
                  className="inline-flex items-center rounded-lg bg-blue-50/70 border border-blue-100 px-2 py-1 text-[10.5px] font-semibold text-blue-700 transition-colors hover:bg-blue-100 hover:text-blue-900 cursor-pointer shrink-0"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notepad Canvas Container (Scrollable) */}
        <div className="relative mb-4">
          {activeTab === 'edit' ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your clinical observation notes here... (Action impressions will automatically be logged here when performed)."
              className="w-full h-[290px] max-h-[340px] rounded-2xl bg-gray-50 p-4 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-primary/40 focus:shadow-sm resize-none font-sans leading-relaxed notepad-scrollable-canvas overflow-y-auto"
            />
          ) : (
            <div className="w-full h-[290px] max-h-[340px] rounded-2xl bg-gray-50/80 border border-gray-200 p-4 notepad-scrollable-canvas overflow-y-auto">
              <HighlightedNotesView notes={notes} />
            </div>
          )}
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
