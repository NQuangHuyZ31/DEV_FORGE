import type { ApiEndpoint, ApiIntegration } from '@/types/integration'
import type { HttpRequest, KeyValuePair } from '@/types/http'

export function mapEndpointToHttpRequest(
  integration: ApiIntegration,
  endpoint: ApiEndpoint,
  customParams?: Record<string, string>
): HttpRequest {
  const fullUrl = `${integration.baseUrl.replace(/\/$/, '')}${endpoint.path}`

  const params: KeyValuePair[] = (endpoint.queryParams || []).map((p, idx) => ({
    id: `param-${idx}`,
    key: p.key,
    value: customParams?.[p.key] ?? p.value,
    enabled: true,
    description: p.description,
  }))

  const headers: KeyValuePair[] = (endpoint.headers || []).map((h, idx) => ({
    id: `header-${idx}`,
    key: h.key,
    value: h.value,
    enabled: true,
    description: h.description,
  }))

  return {
    url: fullUrl,
    method: endpoint.method,
    params,
    headers,
    bodyType: endpoint.bodyTemplate ? 'json' : 'none',
    bodyContent: endpoint.bodyTemplate || '',
    auth: { type: 'none' },
    timeoutMs: 30000,
  }
}
