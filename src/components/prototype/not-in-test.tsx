import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import { InfoIcon } from "@phosphor-icons/react"

type Notify = (what?: string) => void

const NotInTestContext = createContext<Notify>(() => {})

/**
 * Shows a small "Not part of this test" notice for controls outside the test's scope
 * (stepper View/Edit, header links, Save, etc.).
 */
export function NotInTestProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const notify = useCallback<Notify>((what) => {
    window.clearTimeout(timer.current)
    setMessage(what ? `${what} isn’t part of this test` : "This isn’t part of this test")
    timer.current = window.setTimeout(() => setMessage(null), 2400)
  }, [])

  return (
    <NotInTestContext.Provider value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-60 flex justify-center px-margin"
      >
        {message && (
          <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground shadow-lg type-caption font-medium animate-in fade-in slide-in-from-bottom-2">
            <InfoIcon className="size-4" />
            {message}
          </div>
        )}
      </div>
    </NotInTestContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotInTest = () => useContext(NotInTestContext)
