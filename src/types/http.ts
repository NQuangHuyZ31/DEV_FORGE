export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
  description?: string
}

export type BodyType = 'none' | 'json' | 'text' | 'urlencoded'

export type AuthType = 'none' | 'bearer' | 'apikey'
export type ApiKeyLocation = 'header' | 'query'

export interface AuthConfig {
  type: AuthType
  token?: string
  apiKeyName?: string
  apiKeyValue?: string
  apiKeyLocation?: ApiKeyLocation
}

export interface HttpRequest {
  id?: string
  url: string
  method: HttpMethod
  params: KeyValuePair[]
  headers: KeyValuePair[]
  bodyType: BodyType
  bodyContent: string
  auth: AuthConfig
  timeoutMs?: number
}

export interface HttpResponse {
  status: number
  statusText: string
  ok: boolean
  headers: Record<string, string>
  body: string
  parsedJson?: unknown
  isJson: boolean
  durationMs: number
  contentType: string
  sizeBytes: number
  timestamp: number
}

export type HttpErrorGroup =
  | 'invalid-url'
  | 'network'
  | 'cors'
  | 'timeout'
  | 'http-error'
  | 'json-parse'
  | 'abort'
  | 'unknown'

export interface HttpErrorInfo {
  group: HttpErrorGroup
  title: string
  message: string
  hint?: string
  status?: number
  rawResponse?: HttpResponse
}

export type RequestState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'http-error'
  | 'network-error'
  | 'timeout'
  | 'cancelled'
