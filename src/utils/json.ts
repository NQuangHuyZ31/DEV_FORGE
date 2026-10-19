export interface JsonValidationResult {
  isValid: boolean
  error?: string
  line?: number
  column?: number
}

export interface JsonFormatResult {
  success: boolean
  result: string
  error?: string
  line?: number
  column?: number
}

export type IndentOption = 2 | 4 | 'minified'

export function validateJson(input: string): JsonValidationResult {
  if (!input || input.trim() === '') {
    return { isValid: false, error: 'Empty JSON input' }
  }

  try {
    JSON.parse(input)
    return { isValid: true }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const posMatch = errorMsg.match(/position (\d+)/i)
    let line: number | undefined
    let column: number | undefined

    if (posMatch) {
      const pos = parseInt(posMatch[1], 10)
      const lines = input.slice(0, pos).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }

    return {
      isValid: false,
      error: errorMsg,
      line,
      column,
    }
  }
}

export function formatJson(input: string, indent: IndentOption = 2): JsonFormatResult {
  if (!input || input.trim() === '') {
    return { success: false, result: '', error: 'Please enter JSON string to format' }
  }

  try {
    const parsed = JSON.parse(input)
    if (indent === 'minified') {
      return { success: true, result: JSON.stringify(parsed) }
    }
    return { success: true, result: JSON.stringify(parsed, null, indent) }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const posMatch = errorMsg.match(/position (\d+)/i)
    let line: number | undefined
    let column: number | undefined

    if (posMatch) {
      const pos = parseInt(posMatch[1], 10)
      const lines = input.slice(0, pos).split('\n')
      line = lines.length
      column = lines[lines.length - 1].length + 1
    }

    return {
      success: false,
      result: input, // keep original input as required by spec T-02
      error: errorMsg,
      line,
      column,
    }
  }
}
