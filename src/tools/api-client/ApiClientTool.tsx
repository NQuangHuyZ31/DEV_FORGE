import React, { useState } from 'react'
import { Card, Button, Tabs, Space, Typography } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import type {
  HttpMethod,
  KeyValuePair,
  BodyType,
  AuthType,
  ApiKeyLocation,
  HttpRequest,
  HttpResponse,
  HttpErrorInfo,
} from '@/types/http'
import { defaultHttpClient } from '@/services/http/http-client'
import { CorsInfoModal } from '@/components/common/CorsInfoModal'
import { RequestUrlBar } from './components/RequestUrlBar'
import { ParamsTab } from './components/ParamsTab'
import { HeadersTab } from './components/HeadersTab'
import { BodyTab } from './components/BodyTab'
import { AuthTab } from './components/AuthTab'
import { ResponseViewer } from './components/ResponseViewer'

const { Title, Text } = Typography

interface ApiClientToolProps {
  initialRequest?: Partial<HttpRequest>
  onSwitchToExplorer?: () => void
}

export const ApiClientTool: React.FC<ApiClientToolProps> = ({
  initialRequest,
  onSwitchToExplorer,
}) => {
  // Request States
  const [method, setMethod] = useState<HttpMethod>(initialRequest?.method || 'GET')
  const [url, setUrl] = useState<string>(
    initialRequest?.url || 'https://jsonplaceholder.typicode.com/posts/1'
  )
  const [params, setParams] = useState<KeyValuePair[]>(initialRequest?.params || [])
  const [headers, setHeaders] = useState<KeyValuePair[]>(
    initialRequest?.headers || [
      { id: '1', key: 'Accept', value: 'application/json', enabled: true },
    ]
  )
  const [bodyType, setBodyType] = useState<BodyType>(initialRequest?.bodyType || 'none')
  const [bodyContent, setBodyContent] = useState<string>(initialRequest?.bodyContent || '')

  // Auth States
  const [authType, setAuthType] = useState<AuthType>(initialRequest?.auth?.type || 'none')
  const [bearerToken, setBearerToken] = useState<string>(initialRequest?.auth?.token || '')
  const [apiKeyName, setApiKeyName] = useState<string>(initialRequest?.auth?.apiKeyName || 'X-API-Key')
  const [apiKeyValue, setApiKeyValue] = useState<string>(initialRequest?.auth?.apiKeyValue || '')
  const [apiKeyLocation, setApiKeyLocation] = useState<ApiKeyLocation>(
    initialRequest?.auth?.apiKeyLocation || 'header'
  )

  // Execution States
  const [loading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<HttpResponse | null>(null)
  const [errorInfo, setErrorInfo] = useState<HttpErrorInfo | null>(null)
  const [corsModalOpen, setCorsModalOpen] = useState<boolean>(false)

  // Sync when initialRequest prop changes (e.g. from Explorer)
  React.useEffect(() => {
    if (initialRequest) {
      if (initialRequest.method) setMethod(initialRequest.method)
      if (initialRequest.url) setUrl(initialRequest.url)
      if (initialRequest.params) setParams(initialRequest.params)
      if (initialRequest.headers) setHeaders(initialRequest.headers)
      if (initialRequest.bodyType) setBodyType(initialRequest.bodyType)
      if (initialRequest.bodyContent !== undefined) setBodyContent(initialRequest.bodyContent)
    }
  }, [initialRequest])

  const handleSend = async () => {
    if (loading) return

    setErrorInfo(null)
    setResponse(null)
    setLoading(true)

    const req: HttpRequest = {
      url,
      method,
      params,
      headers,
      bodyType,
      bodyContent,
      auth: {
        type: authType,
        token: bearerToken,
        apiKeyName,
        apiKeyValue,
        apiKeyLocation,
      },
      timeoutMs: 30000,
    }

    try {
      const result = await defaultHttpClient.execute(req)
      setLoading(false)

      if (result.success && result.response) {
        setResponse(result.response)
      } else if (result.error) {
        setErrorInfo(result.error)
        if (result.error.rawResponse) {
          setResponse(result.error.rawResponse)
        }
      }
    } catch (err: unknown) {
      setLoading(false)
      setErrorInfo({
        group: 'unknown',
        title: 'Unexpected Client Error',
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const handleCancel = () => {
    defaultHttpClient.cancel()
    setLoading(false)
  }

  const activeParamsCount = params.filter((p) => p.enabled && p.key).length
  const activeHeadersCount = headers.filter((h) => h.enabled && h.key).length

  return (
    <div className="tool-container">
      {/* Header bar */}
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            REST API Client
          </Title>
          <Text type="secondary">
            Send in-browser HTTP requests (GET, POST, PUT, PATCH, DELETE) with custom headers, query params, and auth.
          </Text>
        </div>
        <Space wrap>
          {onSwitchToExplorer && (
            <Button onClick={onSwitchToExplorer}>
              Load Predefined API Presets
            </Button>
          )}
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => setCorsModalOpen(true)}
          >
            CORS & Network Guide
          </Button>
        </Space>
      </div>

      {/* URL & Method Bar */}
      <RequestUrlBar
        method={method}
        onMethodChange={setMethod}
        url={url}
        onUrlChange={setUrl}
        loading={loading}
        onSend={handleSend}
        onCancel={handleCancel}
      />

      {/* Configuration Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          defaultActiveKey="params"
          items={[
            {
              key: 'params',
              label: `Params ${activeParamsCount ? `(${activeParamsCount})` : ''}`,
              children: <ParamsTab params={params} onParamsChange={setParams} />,
            },
            {
              key: 'headers',
              label: `Headers ${activeHeadersCount ? `(${activeHeadersCount})` : ''}`,
              children: <HeadersTab headers={headers} onHeadersChange={setHeaders} />,
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <BodyTab
                  method={method}
                  bodyType={bodyType}
                  onBodyTypeChange={setBodyType}
                  bodyContent={bodyContent}
                  onBodyContentChange={setBodyContent}
                />
              ),
            },
            {
              key: 'auth',
              label: `Auth ${authType !== 'none' ? '(Active)' : ''}`,
              children: (
                <AuthTab
                  authType={authType}
                  onAuthTypeChange={setAuthType}
                  bearerToken={bearerToken}
                  onBearerTokenChange={setBearerToken}
                  apiKeyName={apiKeyName}
                  onApiKeyNameChange={setApiKeyName}
                  apiKeyValue={apiKeyValue}
                  onApiKeyValueChange={setApiKeyValue}
                  apiKeyLocation={apiKeyLocation}
                  onApiKeyLocationChange={setApiKeyLocation}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Response Section */}
      <ResponseViewer
        loading={loading}
        response={response}
        errorInfo={errorInfo}
        onOpenCorsGuide={() => setCorsModalOpen(true)}
      />

      <CorsInfoModal open={corsModalOpen} onClose={() => setCorsModalOpen(false)} />
    </div>
  )
}
