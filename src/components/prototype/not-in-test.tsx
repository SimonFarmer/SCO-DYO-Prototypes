import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react"
import { InfoIcon } from "@phosphor-icons/react"

/**
 * `scope`: "test" (the unmoderated tests) or "task" (the full-flow study's tasks). `plural` reads "… aren’t part of"
 * for a plural subject ("Ready to Ship rings").
 */
type Notify = (what?: string, scope?: "test" | "task", plural?: boolean) => void

const NotInTestContext = createContext<Notify>(() => {})

/**
 * Shows a small "Not part of this test" notice for controls outside the test's scope
 * (stepper View/Edit, header links, Save, etc.).
 */
export function NotInTestProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const notify = useCallback<Notify>((what, scope = "test", plural = false) => {
    window.clearTimeout(timer.current)
    setMessage(what ? `${what} ${plural ? "aren’t" : "isn’t"} part of this ${scope}` : `This isn’t part of this ${scope}`)
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
