export async function copyToClipboard(text: string): Promise<{ success: boolean; error?: string }> {
  if (text === undefined || text === null) {
    return { success: false, error: 'Nothing to copy' }
  }

  // Modern async clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true }
    } catch {
      // Fallback below
    }
  }

  // Fallback for non-secure contexts or legacy browsers
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    textArea.setAttribute('readonly', '')
    document.body.appendChild(textArea)
    textArea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    if (successful) {
      return { success: true }
    }
    return { success: false, error: 'Clipboard copy failed' }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to access clipboard',
    }
  }
}
