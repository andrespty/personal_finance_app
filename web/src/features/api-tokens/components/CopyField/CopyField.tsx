import { useRef, useState } from 'react'

import { Button } from '@/components/ui'

/** Read-only value with a Copy button. Falls back to selecting the text. */
export function CopyField({ label, value }: { label: string; value: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      inputRef.current?.select()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted text-sm">{label}</span>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          readOnly
          value={value}
          aria-label={label}
          onFocus={(e) => e.target.select()}
          className="num bg-fill text-fg focus-visible:ring-accent h-11 min-w-0 flex-1 rounded-xl px-3 font-mono text-[13px] outline-none focus-visible:ring-2"
        />
        <Button variant="secondary" onClick={copy} className="h-11">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
