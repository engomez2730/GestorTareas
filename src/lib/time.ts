/** Strict 'HH:MM' duration format used for original_time and worked_time. */
export const TIME_REGEX = /^[0-9]{2}:[0-5][0-9]$/

export function isValidTimeFormat(value: string): boolean {
  return TIME_REGEX.test(value)
}

export function timeToMinutes(value: string): number {
  const match = TIME_REGEX.exec(value)
  if (!match) return 0
  const [hours, minutes] = value.split(':')
  return Number(hours) * 60 + Number(minutes)
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Reformats raw keystrokes into a partial/complete 'HH:MM' string, clamping minutes to 59. */
export function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits

  const hours = digits.slice(0, 2)
  let minutes = digits.slice(2, 4)
  if (minutes.length === 2 && Number(minutes) > 59) minutes = '59'
  return `${hours}:${minutes}`
}
