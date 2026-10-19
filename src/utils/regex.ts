export interface RegexMatchItem {
  index: number
  match: string
  groups: string[]
  namedGroups?: Record<string, string>
}

export interface RegexExecutionResult {
  isValid: boolean
  error?: string
  matches: RegexMatchItem[]
  matchCount: number
  replacedOutput?: string
}

export interface RegexPreset {
  id: string
  name: string
  category: 'web' | 'format' | 'validation' | 'vietnam'
  pattern: string
  flags: string
  description: string
  sampleText: string
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: 'email',
    name: 'Email Address',
    category: 'web',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: 'g',
    description: 'Matches standard email addresses (RFC 5322 compatible)',
    sampleText: 'contact@devforge.dev, user.name+tag@gmail.com, invalid@email',
  },
  {
    id: 'vietnam-phone',
    name: 'Vietnamese Phone Number',
    category: 'vietnam',
    pattern: '(0|\\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}',
    flags: 'g',
    description: 'Validates Vietnamese mobile numbers (Viettel, Vinaphone, Mobifone, etc.)',
    sampleText: '0981234567, +84901234567, 0389998888, 123456789',
  },
  {
    id: 'url-web',
    name: 'Web URL (HTTP / HTTPS)',
    category: 'web',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'g',
    description: 'Matches HTTP and HTTPS URLs with paths and query params',
    sampleText: 'https://devforge.dev/tools?q=regex, http://localhost:5173, ftp://not-matched.org',
  },
  {
    id: 'ipv4',
    name: 'IPv4 Address',
    category: 'web',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'Matches valid IPv4 addresses from 0.0.0.0 to 255.255.255.255',
    sampleText: '192.168.1.1, 10.0.0.254, 127.0.0.1, 999.999.999.999',
  },
  {
    id: 'hex-color',
    name: 'Hex Color Code',
    category: 'format',
    pattern: '#(?:[0-9a-fA-F]{3,4}){1,2}\\b',
    flags: 'g',
    description: 'Matches CSS hex colors (#RGB, #RRGGBB, #RGBA, #RRGGBBAA)',
    sampleText: '#1677ff, #ffffff, #fff, #111827cc, not-a-color',
  },
  {
    id: 'date-iso',
    name: 'ISO Date (YYYY-MM-DD)',
    category: 'format',
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    description: 'Matches dates in ISO 8601 format (YYYY-MM-DD)',
    sampleText: '2026-10-19, 2025-12-31, 2026-02-28, 2026-99-99',
  },
  {
    id: 'strong-password',
    name: 'Strong Password Rule',
    category: 'validation',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    description: 'Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, and 1 special char',
    sampleText: 'DevForge@2026',
  },
  {
    id: 'slug',
    name: 'URL Slug / Kebab Case',
    category: 'format',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    flags: '',
    description: 'Lowercase alphanumeric words joined by single hyphens',
    sampleText: 'regex-tester-pro-v1',
  },
  {
    id: 'vietnamese-words',
    name: 'Vietnamese Words (Unicode)',
    category: 'vietnam',
    pattern: '[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\\s]+',
    flags: 'gu',
    description: 'Matches Vietnamese full Unicode characters with diacritics',
    sampleText: 'Xin chào Việt Nam, kiểm tra biểu thức chính quy DevForge 2026',
  },
  {
    id: 'html-tag',
    name: 'HTML Tag',
    category: 'format',
    pattern: '<\\/?([a-zA-Z0-9]+)(\\s+[^>]*?)?\\/?>',
    flags: 'g',
    description: 'Matches opening, closing, and self-closing HTML tags',
    sampleText: '<div class="card"><span id="title">Hello</span><img src="pic.png" /></div>',
  },
]

/**
 * Execute regex safely on a test string with capture groups & substitution
 */
export function executeRegex(
  pattern: string,
  flags: string,
  testString: string,
  replacementPattern?: string
): RegexExecutionResult {
  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      replacedOutput: testString,
    }
  }

  let regex: RegExp
  try {
    regex = new RegExp(pattern, flags)
  } catch (err: unknown) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid Regular Expression syntax',
      matches: [],
      matchCount: 0,
      replacedOutput: testString,
    }
  }

  const matches: RegexMatchItem[] = []

  try {
    // If global flag 'g' is active, use matchAll or exec in a loop
    if (flags.includes('g')) {
      const matchIterator = testString.matchAll(regex)
      for (const m of matchIterator) {
        if (m.index === undefined) continue
        const groups = m.slice(1)
        matches.push({
          index: m.index,
          match: m[0],
          groups,
          namedGroups: m.groups ? { ...m.groups } : undefined,
        })
        // Safety bound: prevent catastrophic backtracking infinite loops
        if (matches.length >= 1000) break
      }
    } else {
      const m = regex.exec(testString)
      if (m && m.index !== undefined) {
        matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
          namedGroups: m.groups ? { ...m.groups } : undefined,
        })
      }
    }

    let replacedOutput: string | undefined = undefined
    if (replacementPattern !== undefined) {
      replacedOutput = testString.replace(regex, replacementPattern)
    }

    return {
      isValid: true,
      matches,
      matchCount: matches.length,
      replacedOutput,
    }
  } catch (err: unknown) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Error evaluating Regular Expression',
      matches: [],
      matchCount: 0,
      replacedOutput: testString,
    }
  }
}
