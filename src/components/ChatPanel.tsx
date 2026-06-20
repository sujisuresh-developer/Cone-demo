import { useRef, useEffect } from 'react'
import { Lightbulb, Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2, Send } from 'lucide-react'

export type ChatMessage = {
  id: string
  sender: 'patient' | 'doctor' | 'system'
  text: string
}

export const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'patient', text: "Doctor... help... I can't breathe... my chest is so tight..." },
  { id: '2', sender: 'doctor', text: "I'm here. We're going to help you. Let's get you set up on the monitor first." },
  { id: '3', sender: 'patient', text: "It feels like I'm suffocating... Please hurry..." },
  { id: '4', sender: 'doctor', text: "I understand. I'm placing the oxygen mask on you now. Let's get a portable chest X-Ray and check your lungs." },
  { id: '5', sender: 'patient', text: "Okay... thank you..." },
]

export function AudioControls({
  expanded = false,
  onUseHint,
  isMuted = true,
  isSoundOn = true,
  onToggleMute,
  onToggleSound,
}: {
  expanded?: boolean
  onUseHint?: () => void
  isMuted?: boolean
  isSoundOn?: boolean
  onToggleMute?: () => void
  onToggleSound?: () => void
}) {
  if (expanded) {
    return (
      <div className="flex items-center justify-center gap-3">
        {/* Hint button */}
        <button
          type="button"
          onClick={onUseHint}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 card-shadow transition-all hover:scale-105 hover:bg-gray-50 active:scale-95"
          title="Request clinical hint"
        >
          <Lightbulb className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Mic Active (Unmuted) button */}
        <button
          type="button"
          onClick={isMuted ? onToggleMute : undefined}
          className={`flex h-11 w-11 items-center justify-center rounded-full card-shadow transition-all hover:scale-105 active:scale-95 ${
            !isMuted
              ? 'bg-primary text-white font-bold'
              : 'bg-white text-gray-400 hover:bg-gray-50'
          }`}
          title="Mic On"
        >
          <Mic className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Mic Muted button */}
        <button
          type="button"
          onClick={!isMuted ? onToggleMute : undefined}
          className={`flex h-11 w-11 items-center justify-center rounded-full card-shadow transition-all hover:scale-105 active:scale-95 ${
            isMuted
              ? 'bg-primary text-white font-bold'
              : 'bg-white text-gray-400 hover:bg-gray-50'
          }`}
          title="Mute Mic"
        >
          <MicOff className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Sound toggle button */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`flex h-11 w-11 items-center justify-center rounded-full card-shadow transition-all hover:scale-105 active:scale-95 ${
            isSoundOn
              ? 'bg-white text-gray-600 hover:bg-gray-50'
              : 'bg-red-50 border border-red-200 text-red-500'
          }`}
          title={isSoundOn ? "Mute sound" : "Unmute sound"}
        >
          {isSoundOn ? (
            <Volume2 className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <VolumeX className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Hint button */}
      <button
        type="button"
        onClick={onUseHint}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-600 card-shadow transition-all hover:scale-105 hover:bg-gray-50 active:scale-95"
        title="Request clinical hint"
      >
        <Lightbulb className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Combined Mic / Mute badge */}
      <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 card-shadow">
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-105 ${
            !isMuted
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
          title="Mic On"
        >
          <Mic className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-105 ${
            isMuted
              ? 'bg-primary text-white font-bold shadow-sm'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
          title="Mute Mic"
        >
          <MicOff className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Sound toggle button */}
      <button
        type="button"
        onClick={onToggleSound}
        className={`flex h-11 w-11 items-center justify-center rounded-full card-shadow transition-all hover:scale-105 active:scale-95 ${
          isSoundOn
            ? 'bg-white text-gray-600 hover:bg-gray-50'
            : 'bg-red-50 border border-red-200 text-red-500'
        }`}
        title={isSoundOn ? "Mute sound" : "Unmute sound"}
      >
        {isSoundOn ? (
          <Volume2 className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <VolumeX className="h-5 w-5" strokeWidth={1.5} />
        )}
      </button>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.sender === 'system') {
    return (
      <div className="flex justify-center my-1.5">
        <div className="max-w-[95%] rounded-xl bg-amber-50/80 px-4 py-2.5 border border-amber-200/50 card-shadow">
          <p className="text-[11px] leading-relaxed text-amber-950 text-center font-semibold italic">
            {message.text}
          </p>
        </div>
      </div>
    )
  }

  if (message.sender === 'patient') {
    return (
      <div className="flex items-end gap-2">
        <img
          src="/p.png"
          alt="Patient"
          className="h-8 w-8 shrink-0 rounded-full object-cover object-top"
        />
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-blue-50 px-3.5 py-2.5">
          <p className="text-[12px] leading-relaxed text-gray-700">{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-blue-50 px-3.5 py-2.5">
        <p className="text-[12px] leading-relaxed text-gray-700">{message.text}</p>
      </div>
    </div>
  )
}

type ChatPanelProps = {
  expanded: boolean
  onToggleExpand: () => void
  message: string
  onMessageChange: (value: string) => void
  messages: ChatMessage[]
  onSend: () => void
}

export default function ChatPanel({
  expanded,
  onToggleExpand,
  message,
  onMessageChange,
  messages,
  onSend,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [expanded, messages])

  return (
    <div
      className={`chat-panel-root ${expanded ? 'chat-panel-expanded' : 'chat-panel-collapsed'}`}
    >
      <div className="chat-panel-card">
        {/* Collapse button – only visible when expanded */}
        <div
          className={`flex justify-end px-4 pt-4 transition-all duration-400 ease-in-out ${
            expanded
              ? 'max-h-12 opacity-100'
              : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={onToggleExpand}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Collapse chat"
          >
            <Minimize2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Collapsed header – patient bubble + expand button */}
        <div
          className={`transition-all duration-400 ease-in-out ${
            expanded
              ? 'pointer-events-none max-h-0 overflow-hidden opacity-0'
              : 'max-h-24 opacity-100'
          }`}
        >
          <div className="flex items-start justify-between gap-2 p-4 pb-3">
            <div className="flex items-start gap-2.5">
              <img
                src="/p.png"
                alt="Patient avatar"
                className="h-8 w-8 shrink-0 rounded-full object-cover object-top"
              />
              <div className="rounded-2xl rounded-tl-md bg-blue-50 px-3.5 py-2">
                <p className="text-[12px] leading-relaxed text-gray-600">
                  {messages[0]?.text}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleExpand}
              className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Expand chat"
            >
              <Maximize2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Message list – only visible when expanded */}
        <div
          ref={scrollRef}
          className={`chat-messages-area space-y-4 overflow-y-auto px-5 ${
            expanded
              ? 'max-h-[min(350px,45vh)] pb-4 opacity-100'
              : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
          }`}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        {/* Input area */}
        <div
          className={`transition-all duration-400 ease-in-out ${
            expanded ? 'border-t border-gray-100 px-5 py-4' : 'px-4 pb-4'
          }`}
        >
          <div
            className={`flex items-center gap-2 bg-gray-50 transition-all duration-400 ease-in-out ${
              expanded
                ? 'rounded-2xl border border-gray-100 px-4 py-3'
                : 'rounded-xl border border-gray-100 px-3 py-2.5'
            }`}
          >
            <input
              type="text"
              placeholder="Type a message to patient..."
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder:text-gray-400 outline-none"
            />
            {/* Mic icon only in expanded mode */}
            <button
              type="button"
              className={`text-gray-400 transition-all duration-300 hover:text-gray-600 ${
                expanded ? 'w-4 opacity-100' : 'pointer-events-none w-0 overflow-hidden opacity-0'
              }`}
            >
              <Mic className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onSend}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover"
            >
              <Send className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
