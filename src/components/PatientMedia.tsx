const VIDEO_EXTENSIONS = /\.(mp4|webm|mov)$/i

type Props = {
  /** Path under /public, without the leading slash — e.g. "xrayroom-entry.mp4" or "patient-happy.png". */
  src: string
  alt: string
  className?: string
}

/**
 * Some patient snapshot assets may be short clips rather than stills. A plain <img> silently
 * fails to decode video (no error, just nothing rendered) — this picks the right element
 * based on the file extension so either kind works.
 */
export default function PatientMedia({ src, alt, className }: Props) {
  if (VIDEO_EXTENSIONS.test(src)) {
    return (
      <video
        src={`/${src}`}
        className={className}
        autoPlay
        muted
        loop
        playsInline
      />
    )
  }
  return <img src={`/${src}`} alt={alt} className={className} />
}
