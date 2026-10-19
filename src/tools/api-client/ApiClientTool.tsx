import React, { useState } from 'react'
import {
  Card,
  Input,
  Select,
  Button,
  Tabs,
  Space,
  Typography,
  Tag,
  Alert,
  Checkbox,
  Radio,
  Tooltip,
  Row,
  Col,
  Empty,
  Spin,
} from 'antd'
import {
  SendOutlined,
  StopOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SafetyCertificateOutlined,
  WarningOutlined,
} from '@ant-design/icons'
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
import { formatJson } from '@/utils/json'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CopyButton } from '@/components/common/CopyButton'
import { CorsInfoModal } from '@/components/common/CorsInfoModal'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#1677ff',
  POST: '#52c41a',
  PUT: '#fa8c16',
  PATCH: '#722ed1',
  DELETE: '#f5222d',
}

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

  // Auth
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
  const [rawView, setRawView] = useState<boolean>(false)
  const [corsModalOpen, setCorsModalOpen] = useState<boolean>(false)

  // Update when initialRequest changes
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
    if (loading) return // Prevent double sends

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

  // Params Table Helpers
  const addParam = () => {
    setParams([
      ...params,
      { id: String(Date.now()), key: '', value: '', enabled: true },
    ])
  }

  const updateParam = (id: string, field: keyof KeyValuePair, value: any) => {
    setParams(params.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const deleteParam = (id: string) => {
    setParams(params.filter((p) => p.id !== id))
  }

  // Headers Table Helpers
  const addHeader = () => {
    setHeaders([
      ...headers,
      { id: String(Date.now()), key: '', value: '', enabled: true },
    ])
  }

  const updateHeader = (id: string, field: keyof KeyValuePair, value: any) => {
    setHeaders(headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
  }

  const deleteHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id))
  }

  // Format JSON Body
  const handleFormatBody = () => {
    const res = formatJson(bodyContent, 2)
    if (res.success) {
      setBodyContent(res.result)
    }
  }

  // Download response
  const handleDownloadResponse = () => {
    if (!response) return
    const blob = new Blob([response.body], {
      type: response.contentType || 'application/json',
    })
    const fileUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = `response-${Date.now()}.${response.isJson ? 'json' : 'txt'}`
    a.click()
    URL.revokeObjectURL(fileUrl)
  }

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
      <Card style={{ margin: '16px 0' }} className="url-bar-card">
        <Space.Compact style={{ width: '100%' }}>
          <Select
            value={method}
            onChange={(val) => setMethod(val as HttpMethod)}
            style={{ width: 120, fontWeight: 700 }}
            options={[
              { value: 'GET', label: <span style={{ color: METHOD_COLORS.GET }}>GET</span> },
              { value: 'POST', label: <span style={{ color: METHOD_COLORS.POST }}>POST</span> },
              { value: 'PUT', label: <span style={{ color: METHOD_COLORS.PUT }}>PUT</span> },
              { value: 'PATCH', label: <span style={{ color: METHOD_COLORS.PATCH }}>PATCH</span> },
              { value: 'DELETE', label: <span style={{ color: METHOD_COLORS.DELETE }}>DELETE</span> },
            ]}
          />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL (e.g. https://jsonplaceholder.typicode.com/posts)"
            onPressEnter={handleSend}
            style={{ fontFamily: 'monospace' }}
          />
          {loading ? (
            <Button
              type="primary"
              danger
              icon={<StopOutlined />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              style={{ background: METHOD_COLORS[method], borderColor: METHOD_COLORS[method] }}
            >
              Send
            </Button>
          )}
        </Space.Compact>
      </Card>

      {/* Request Configuration Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          defaultActiveKey="params"
          items={[
            {
              key: 'params',
              label: `Params ${params.filter((p) => p.enabled && p.key).length ? `(${params.filter((p) => p.enabled && p.key).length})` : ''}`,
              children: (
                <div>
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">Query parameters appended to the URL query string.</Text>
                    <Button size="small" icon={<PlusOutlined />} onClick={addParam}>
                      Add Param
                    </Button>
                  </div>
                  {params.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No query parameters configured"
                    >
                      <Button size="small" type="dashed" onClick={addParam}>
                        Add First Parameter
                      </Button>
                    </Empty>
                  ) : (
                    <table className="key-value-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th style={{ width: '40%' }}>Parameter Key</th>
                          <th>Value</th>
                          <th style={{ width: 50 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {params.map((p) => (
                          <tr key={p.id}>
                            <td style={{ textAlign: 'center' }}>
                              <Checkbox
                                checked={p.enabled}
                                onChange={(e) => updateParam(p.id, 'enabled', e.target.checked)}
                              />
                            </td>
                            <td>
                              <Input
                                value={p.key}
                                onChange={(e) => updateParam(p.id, 'key', e.target.value)}
                                placeholder="key (e.g. limit, page)"
                              />
                            </td>
                            <td>
                              <Input
                                value={p.value}
                                onChange={(e) => updateParam(p.id, 'value', e.target.value)}
                                placeholder="value"
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => deleteParam(p.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ),
            },
            {
              key: 'headers',
              label: `Headers ${headers.filter((h) => h.enabled && h.key).length ? `(${headers.filter((h) => h.enabled && h.key).length})` : ''}`,
              children: (
                <div>
                  <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">HTTP headers sent with the request.</Text>
                    <Button size="small" icon={<PlusOutlined />} onClick={addHeader}>
                      Add Header
                    </Button>
                  </div>
                  {headers.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No custom headers">
                      <Button size="small" type="dashed" onClick={addHeader}>
                        Add Header
                      </Button>
                    </Empty>
                  ) : (
                    <table className="key-value-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th style={{ width: '40%' }}>Header Name</th>
                          <th>Value</th>
                          <th style={{ width: 50 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {headers.map((h) => (
                          <tr key={h.id}>
                            <td style={{ textAlign: 'center' }}>
                              <Checkbox
                                checked={h.enabled}
                                onChange={(e) => updateHeader(h.id, 'enabled', e.target.checked)}
                              />
                            </td>
                            <td>
                              <Input
                                value={h.key}
                                onChange={(e) => updateHeader(h.id, 'key', e.target.value)}
                                placeholder="Header (e.g. Authorization, Accept)"
                              />
                            </td>
                            <td>
                              <Input
                                value={h.value}
                                onChange={(e) => updateHeader(h.id, 'value', e.target.value)}
                                placeholder="Value"
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => deleteHeader(h.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ),
            },
            {
              key: 'body',
              label: 'Body',
              children: (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Space size="middle">
                      <Text strong>Body Type:</Text>
                      <Radio.Group
                        value={bodyType}
                        onChange={(e) => setBodyType(e.target.value as BodyType)}
                      >
                        <Radio.Button value="none">none</Radio.Button>
                        <Radio.Button value="json">JSON (application/json)</Radio.Button>
                        <Radio.Button value="text">Raw Text (text/plain)</Radio.Button>
                      </Radio.Group>

                      {bodyType === 'json' && (
                        <Button
                          size="small"
                          icon={<CodeOutlined />}
                          onClick={handleFormatBody}
                        >
                          Beautify JSON
                        </Button>
                      )}
                    </Space>
                  </div>

                  {method === 'GET' && bodyType !== 'none' && (
                    <Alert
                      type="warning"
                      showIcon
                      icon={<WarningOutlined />}
                      message="HTTP GET with Body"
                      description="Standard HTTP GET requests do not convey body payloads. DevForge will omit the body for GET requests according to standard fetch specifications."
                      style={{ marginBottom: 12 }}
                    />
                  )}

                  {bodyType === 'none' ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="This request does not have a body"
                    />
                  ) : (
                    <TextArea
                      value={bodyContent}
                      onChange={(e) => setBodyContent(e.target.value)}
                      placeholder={
                        bodyType === 'json'
                          ? '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}'
                          : 'Enter raw request body payload...'
                      }
                      rows={10}
                      className="monospace-editor"
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'auth',
              label: `Auth ${authType !== 'none' ? '(Active)' : ''}`,
              children: (
                <div style={{ maxWidth: 650 }}>
                  <Alert
                    type="info"
                    showIcon
                    icon={<SafetyCertificateOutlined />}
                    message="Privacy & Credential Isolation"
                    description="Authentication tokens and keys are kept strictly in-memory during this tab session. DevForge NEVER saves credentials to localStorage, NEVER persists secrets to cookies, and NEVER sends them to analytics."
                    style={{ marginBottom: 16 }}
                  />

                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                      <Text strong>Authentication Type:</Text>
                      <div style={{ marginTop: 8 }}>
                        <Radio.Group
                          value={authType}
                          onChange={(e) => setAuthType(e.target.value as AuthType)}
                          buttonStyle="solid"
                        >
                          <Radio.Button value="none">No Auth (Public)</Radio.Button>
                          <Radio.Button value="bearer">Bearer Token</Radio.Button>
                          <Radio.Button value="apikey">API Key</Radio.Button>
                        </Radio.Group>
                      </div>
                    </div>

                    {authType === 'bearer' && (
                      <div>
                        <Text strong>Bearer Token:</Text>
                        <Input.Password
                          value={bearerToken}
                          onChange={(e) => setBearerToken(e.target.value)}
                          placeholder="Enter Bearer token (without 'Bearer ' prefix)"
                          iconRender={(visible) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                          }
                          style={{ marginTop: 6 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Will be sent as Header: <Text code>Authorization: Bearer &lt;token&gt;</Text>
                        </Text>
                      </div>
                    )}

                    {authType === 'apikey' && (
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Row gutter={12}>
                          <Col span={10}>
                            <Text strong>Key Name:</Text>
                            <Input
                              value={apiKeyName}
                              onChange={(e) => setApiKeyName(e.target.value)}
                              placeholder="e.g. X-API-Key, api_key"
                              style={{ marginTop: 4 }}
                            />
                          </Col>
                          <Col span={14}>
                            <Text strong>Key Value:</Text>
                            <Input.Password
                              value={apiKeyValue}
                              onChange={(e) => setApiKeyValue(e.target.value)}
                              placeholder="Secret API key value"
                              iconRender={(visible) =>
                                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                              }
                              style={{ marginTop: 4 }}
                            />
                          </Col>
                        </Row>

                        <div style={{ marginTop: 8 }}>
                          <Text strong>Add to: </Text>
                          <Radio.Group
                            value={apiKeyLocation}
                            onChange={(e) =>
                              setApiKeyLocation(e.target.value as ApiKeyLocation)
                            }
                          >
                            <Radio value="header">Request Headers</Radio>
                            <Radio value="query">Query Params</Radio>
                          </Radio.Group>
                        </div>
                      </Space>
                    )}
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Response Viewer Section */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Space size="middle" wrap>
              <Text strong>Response</Text>
              {response && (
                <>
                  <StatusBadge status={response.status} statusText={response.statusText} />
                  <Tag color="blue">{response.durationMs} ms</Tag>
                  <Tag color="default">
                    {response.sizeBytes < 1024
                      ? `${response.sizeBytes} B`
                      : `${(response.sizeBytes / 1024).toFixed(1)} KB`}
                  </Tag>
                  {response.contentType && (
                    <Tag color="cyan" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {response.contentType.split(';')[0]}
                    </Tag>
                  )}
                </>
              )}
            </Space>
            {response && (
              <Space>
                <Radio.Group
                  size="small"
                  value={rawView}
                  onChange={(e) => setRawView(e.target.value)}
                >
                  <Radio.Button value={false}>Formatted</Radio.Button>
                  <Radio.Button value={true}>Raw</Radio.Button>
                </Radio.Group>
                <CopyButton text={response.body} size="small" />
                <Tooltip title="Download response body">
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadResponse}
                  />
                </Tooltip>
              </Space>
            )}
          </div>
        }
        className="response-card"
      >
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin size="large" />
            <div style={{ marginTop: 12 }}>
              <Text type="secondary">Dispatching request to remote endpoint...</Text>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errorInfo && !loading && (
          <Alert
            type={errorInfo.group === 'cors' || errorInfo.group === 'network' ? 'warning' : 'error'}
            showIcon
            message={errorInfo.title}
            description={
              <div>
                <Paragraph>{errorInfo.message}</Paragraph>
                {errorInfo.hint && (
                  <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                    <strong>Tip:</strong> {errorInfo.hint}
                  </Paragraph>
                )}
                {errorInfo.group === 'cors' && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => setCorsModalOpen(true)}
                  >
                    Open CORS & Testing Guide
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Response Body & Tabs */}
        {!loading && response && (
          <Tabs
            defaultActiveKey="body"
            items={[
              {
                key: 'body',
                label: 'Response Body',
                children: (
                  <TextArea
                    value={
                      !rawView && response.isJson && response.parsedJson
                        ? JSON.stringify(response.parsedJson, null, 2)
                        : response.body
                    }
                    readOnly
                    rows={16}
                    className="monospace-editor"
                  />
                ),
              },
              {
                key: 'headers',
                label: `Headers (${Object.keys(response.headers).length})`,
                children: (
                  <div>
                    <Paragraph type="secondary" style={{ fontSize: 13 }}>
                      Note: Browsers restrict JavaScript from accessing sensitive headers (like Set-Cookie) due to CORS security policies.
                    </Paragraph>
                    <table className="key-value-table">
                      <thead>
                        <tr>
                          <th style={{ width: '35%' }}>Header</th>
                          <th>Value</th>
                          <th style={{ width: 60 }}>Copy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(response.headers).map(([k, v]) => (
                          <tr key={k}>
                            <td>
                              <Text code>{k}</Text>
                            </td>
                            <td>
                              <Text>{v}</Text>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <CopyButton text={v} size="small" type="text" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
            ]}
          />
        )}

        {!loading && !response && !errorInfo && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Enter an HTTP URL and click Send to inspect response headers and payload."
          />
        )}
      </Card>

      <CorsInfoModal open={corsModalOpen} onClose={() => setCorsModalOpen(false)} />
    </div>
  )
}
