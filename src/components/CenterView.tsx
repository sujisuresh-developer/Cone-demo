import { useState, useEffect } from 'react'
import ChatPanel, { AudioControls, type ChatMessage } from './ChatPanel'
import PatientMedia, { VIDEO_EXTENSIONS } from './PatientMedia'



type CenterViewProps = {
  chatExpanded: boolean
  onToggleChat: () => void
  message: string
  onMessageChange: (value: string) => void
  messages: ChatMessage[]
  onSend: () => void
  _onViewPatientDetails: () => void
  onUseHint: () => void
  isMuted: boolean
  isSoundOn: boolean
  onToggleMute: () => void
  onToggleSound: () => void
  patientImage: string
  monitorAttached: boolean
  onOpenVitals: () => void
}

export default function CenterView({
  chatExpanded,
  onToggleChat,
  message,
  onMessageChange,
  messages,
  onSend,
  onUseHint,
  isMuted,
  isSoundOn,
  onToggleMute,
  onToggleSound,
  patientImage,
  monitorAttached,
  onOpenVitals,
}: CenterViewProps) {
  const [currentImg, setCurrentImg] = useState(patientImage)
  const [prevImg, setPrevImg] = useState<string | null>(null)
  const [monitorHovered, setMonitorHovered] = useState(false)

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
      <div className="absolute inset-0 bg-gray-900 overflow-hidden">
        {VIDEO_EXTENSIONS.test(currentImg) && (
          <PatientMedia
            src="action-images/patient-without-monitor.png"
            alt="Patient"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ease-in-out ${
              chatExpanded ? 'scale-105 blur-md' : monitorHovered ? 'scale-125' : ''
            }`}
          />
        )}
        {prevImg && !VIDEO_EXTENSIONS.test(currentImg) && (
          <PatientMedia
            src={prevImg}
            alt="Patient"
            className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-500 ease-in-out ${
              chatExpanded ? 'scale-105 blur-md' : monitorHovered ? 'scale-125' : ''
            }`}
          />
        )}
        <PatientMedia
          key={currentImg}
          src={currentImg}
          alt="Patient in hospital room"
          className={`absolute inset-0 h-full w-full origin-[75%_43%] object-cover object-top transition-transform duration-500 ease-in-out ${
            chatExpanded ? 'scale-105 blur-md' : monitorHovered ? 'scale-125' : ''
          }`}
        />
        <div
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${chatExpanded ? 'bg-white/30' : 'bg-black/5'
            }`}
        />

        {/* Clickable hotspot over the bedside monitor device in the scene — only present when the
         * currently displayed photo is actually the plain monitor-attached shot
         * (action-images/patient-with-monitor.png). Any other override photo (procedure/med
         * after-images, bad-vitals/happy looks, death, arrival) doesn't depict that monitor at
         * this same spot, so the hotspot must not show over those. Hovering zooms the scene in on
         * the monitor; clicking opens the same Live Vitals popup as the "i" button. */}
        {monitorAttached && currentImg === 'action-images/patient-with-monitor.png' && !chatExpanded && (
          <button
            type="button"
            onClick={onOpenVitals}
            onMouseEnter={() => setMonitorHovered(true)}
            onMouseLeave={() => setMonitorHovered(false)}
            aria-label="View live vitals monitor"
            title="View live vitals"
            className="absolute left-[62%] top-[29%] z-20 h-[27%] w-[25%] cursor-pointer rounded-lg"
          />
        )}
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
    </main>
  )
}
