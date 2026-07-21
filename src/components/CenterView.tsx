import { useState, useEffect } from 'react'
import { NotebookPen, FileText } from 'lucide-react'
import ChatPanel, { AudioControls, type ChatMessage } from './ChatPanel'
import ReportsModal from './ReportsModal'
import NotepadModal from './NotepadModal'
import PatientMedia, { VIDEO_EXTENSIONS } from './PatientMedia'



type CenterViewProps = {
  chatExpanded: boolean
  onToggleChat: () => void
  message: string
  onMessageChange: (value: string) => void
  messages: ChatMessage[]
  onSend: () => void
  performedActions: string[]
  onViewOutcome: (actionId: string) => void
  _onViewPatientDetails: () => void
  onUseHint: () => void
  isMuted: boolean
  isSoundOn: boolean
  onToggleMute: () => void
  onToggleSound: () => void
  patientImage: string
}

export default function CenterView({
  chatExpanded,
  onToggleChat,
  message,
  onMessageChange,
  messages,
  onSend,
  performedActions,
  onViewOutcome,
  _onViewPatientDetails,
  onUseHint,
  isMuted,
  isSoundOn,
  onToggleMute,
  onToggleSound,
  patientImage,
}: CenterViewProps) {
  const [reportsOpen, setReportsOpen] = useState(false)
  const [notepadOpen, setNotepadOpen] = useState(false)
  const [currentImg, setCurrentImg] = useState(patientImage)
  const [prevImg, setPrevImg] = useState<string | null>(null)

  useEffect(() => {
    if (patientImage !== currentImg) {
      setPrevImg(currentImg)
      setCurrentImg(patientImage)
      const timer = setTimeout(() => setPrevImg(null), 600)
      return () => clearTimeout(timer)
    }
  }, [patientImage, currentImg])

  const chatProps = {
    onToggleExpand: onToggleChat,
    message,
    onMessageChange,
    messages,
    onSend,
  }

  return (
    <main className="card-shadow relative flex h-full flex-col overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-gray-900">
        {VIDEO_EXTENSIONS.test(currentImg) && (
          <PatientMedia
            src="action-images/patient-without-monitor.png"
            alt="Patient"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ease-in-out ${chatExpanded ? 'scale-105 blur-md' : ''}`}
          />
        )}
        {prevImg && !VIDEO_EXTENSIONS.test(currentImg) && (
          <PatientMedia
            src={prevImg}
            alt="Patient"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ease-in-out ${chatExpanded ? 'scale-105 blur-md' : ''}`}
          />
        )}
        <PatientMedia
          key={currentImg}
          src={currentImg}
          alt="Patient in hospital room"
          className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ease-in-out ${chatExpanded ? 'scale-105 blur-md' : ''}`}
        />
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${chatExpanded ? 'bg-white/30' : 'bg-black/5'
            }`}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end">
        {/* Audio controls & Chat Panel at the bottom */}
        <div className="w-full flex flex-col items-center pb-6">
          {/* Audio controls – visible only when collapsed */}
          <div
            className={`mb-3 transition-all duration-500 ease-in-out ${chatExpanded
                ? 'pointer-events-none max-h-0 overflow-hidden opacity-0'
                : 'max-h-20 opacity-100'
              }`}
          >
            <AudioControls
              onUseHint={onUseHint}
              isMuted={isMuted}
              isSoundOn={isSoundOn}
              onToggleMute={onToggleMute}
              onToggleSound={onToggleSound}
            />
          </div>

          {/* Chat area – single panel */}
          <div className="w-full max-w-[420px] px-4">
            <ChatPanel expanded={chatExpanded} {...chatProps} />
          </div>

          {/* Audio controls for expanded mode */}
          <div
            className={`mt-3 transition-all duration-500 ease-in-out ${chatExpanded
                ? 'max-h-16 opacity-100'
                : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
              }`}
          >
            <AudioControls
              expanded
              onUseHint={onUseHint}
              isMuted={isMuted}
              isSoundOn={isSoundOn}
              onToggleMute={onToggleMute}
              onToggleSound={onToggleSound}
            />
          </div>
        </div>
      </div>

      {/* Floating buttons in corners */}
      <button
        type="button"
        onClick={() => setNotepadOpen(true)}
        className="absolute bottom-6 left-6 z-20 flex flex-col items-center gap-1.5 group animate-fade-in"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white card-shadow transition-all duration-300 hover:scale-105 hover:bg-gray-50">
          <NotebookPen className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-semibold text-gray-700 bg-white/80 px-2 py-0.5 rounded-full card-shadow backdrop-blur-[2px] transition-all group-hover:bg-white">
          Notepad
        </span>
      </button>

      <button
        type="button"
        onClick={() => setReportsOpen(true)}
        className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-1.5 group animate-fade-in"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white card-shadow transition-all duration-300 hover:scale-105 hover:bg-gray-50">
          <FileText className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-semibold text-gray-700 bg-white/80 px-2 py-0.5 rounded-full card-shadow backdrop-blur-[2px] transition-all group-hover:bg-white">
          Reports
        </span>
      </button>
      <NotepadModal
        open={notepadOpen}
        onClose={() => setNotepadOpen(false)}
      />
      <ReportsModal
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        performedActions={performedActions}
        onViewOutcome={onViewOutcome}
      />
    </main>
  )
}
