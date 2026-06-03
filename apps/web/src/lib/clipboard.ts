'use client'

/**
 * Copy plain text to the user's clipboard.
 *
 * - Uses the modern Clipboard API when available.
 * - Falls back to a hidden textarea + document.execCommand('copy') when needed.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = (text ?? '').toString()

  if (!value.trim()) return false

  // Modern API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // Fall through to legacy approach.
  }

  // Legacy fallback (some browsers / embedded contexts)
  try {
    if (typeof document === 'undefined') return false

    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'

    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)

    return ok
  } catch {
    return false
  }
}
