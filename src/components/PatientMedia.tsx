import { useState, useRef, useEffect } from 'react'

export const VIDEO_EXTENSIONS = /\.(mp4|webm|mov)$/i

type Props = {
  /** Path under /public, without the leading slash — e.g. "correct_videos/history_taking.mp4" or "patient-happy.png". */
  src: string
  alt: string
  className?: string
}

/**
 * Renders image or video with smooth fade transitions once video frames are ready to play.
 */
export default function PatientMedia({ src, alt, className }: Props) {
  const isVideo = VIDEO_EXTENSIONS.test(src)
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    setIsReady(false)
  }, [src])

  if (isVideo) {
    const videoClass = `${className ? className + ' ' : ''}${
      isReady ? 'video-fade opacity-100' : 'opacity-0'
    } transition-opacity duration-300`

    return (
      <video
        ref={videoRef}
        src={`/${src}`}
        className={videoClass}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsReady(true)}
        onCanPlay={() => setIsReady(true)}
        onPlaying={() => setIsReady(true)}
      />
    )
  }
  return <img src={`/${src}`} alt={alt} className={className} />
}
