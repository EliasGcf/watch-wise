import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { XIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

function Input({ className, type, ref, ...props }: React.ComponentProps<'input'>) {
  if (type === 'search') {
    return <SearchInput ref={ref} className={className} {...props} />
  }

  return (
    <InputPrimitive
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
    />
  )
}

function SearchInput({ className, ref, ...props }: React.ComponentProps<'input'>) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const setRef = (value: HTMLInputElement | null) => {
    inputRef.current = value
    if (typeof ref === 'function') {
      ref(value)
    } else if (ref) {
      ref.current = value
    }
  }

  return (
    <div
      data-slot="input"
      className={cn(
        'flex h-8 w-full min-w-0 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-3 has-[[aria-invalid=true]]:ring-destructive/20 has-[[disabled]]:pointer-events-none has-[[disabled]]:bg-input/50 has-[[disabled]]:opacity-50 dark:bg-input/30 dark:has-[[aria-invalid=true]]:border-destructive/50 dark:has-[[aria-invalid=true]]:ring-destructive/40',
        className
      )}
    >
      <InputPrimitive
        ref={setRef}
        type="search"
        className="peer h-full min-w-0 flex-1 border-none bg-transparent p-0 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden md:text-sm"
        {...props}
      />
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => {
          const input = inputRef.current
          if (!input) return
          input.value = ''
          input.focus()
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }}
        className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 peer-placeholder-shown:hidden"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

export { Input }
