import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const firstInput = dialogRef.current?.querySelector<HTMLElement>('input, select, textarea, button')
    firstInput?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      previous?.focus()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div aria-labelledby="modal-title" aria-modal="true" className="modal" ref={dialogRef} role="dialog">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button aria-label="Close" className="icon-button" onClick={onClose} title="Close" type="button">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
