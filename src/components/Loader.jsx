export default function Loader({ label = 'Load ho raha hai...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-steel">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-paper-line border-t-ink" />
      <p className="font-mono text-xs">{label}</p>
    </div>
  )
}
