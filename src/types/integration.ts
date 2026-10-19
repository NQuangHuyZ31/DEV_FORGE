import type { HttpMethod } from './http'

export interface ApiEndpointParam {
  key: string
  value: string
  description?: string
  required?: boolean
}

export interface ApiEndpoint {
  id: string
  name: string
  description: string
  path: string
  method: HttpMethod
  queryParams?: ApiEndpointParam[]
  headers?: { key: string; value: string; description?: string }[]
  bodyTemplate?: string
  sampleResponse?: string
}

export interface ApiIntegration {
  id: string
  name: string
  description: string
  baseUrl: string
  docUrl?: string
  corsSupported: boolean
  tags: string[]
  endpoints: ApiEndpoint[]
}
