import { forwardRef, useCallback } from 'react'
import type { ChangeEvent, InputHTMLAttributes } from 'react'
import { formatTimeInput } from '../../lib/time'

type TimeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'maxLength'>

/** Text input that forces the strict 'HH:MM' duration format as the user types. */
export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(
  { onChange, className, ...props },
  ref,
) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = formatTimeInput(event.target.value)
      onChange?.(event)
    },
    [onChange],
  )

  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      placeholder="HH:MM"
      maxLength={5}
      onChange={handleChange}
      className={className ?? 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm'}
    />
  )
})
