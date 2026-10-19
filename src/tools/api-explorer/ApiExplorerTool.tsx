import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Button,
  Tabs,
  List,
  Descriptions,
  Divider,
  Alert,
  Spin,
} from 'antd'
import {
  SendOutlined,
  PlayCircleOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import { availableIntegrations } from '@/integrations/registry'
import type { ApiEndpoint } from '@/types/integration'
import type { HttpRequest, HttpResponse, HttpErrorInfo } from '@/types/http'
import { mapEndpointToHttpRequest } from '@/integrations/jsonplaceholder/mapper'
import { defaultHttpClient } from '@/services/http/http-client'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CopyButton } from '@/components/common/CopyButton'

const { Title, Text } = Typography

interface ApiExplorerToolProps {
  onLoadIntoClient: (req: HttpRequest) => void
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#1677ff',
  POST: '#52c41a',
  PUT: '#fa8c16',
  PATCH: '#722ed1',
  DELETE: '#f5222d',
}

export const ApiExplorerTool: React.FC<ApiExplorerToolProps> = ({ onLoadIntoClient }) => {
  const [activeIntegrationId, setActiveIntegrationId] = useState<string>(
    availableIntegrations[0].id
  )
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(
    availableIntegrations[0].endpoints[0]
  )

  const [executing, setExecuting] = useState<boolean>(false)
  const [quickResponse, setQuickResponse] = useState<HttpResponse | null>(null)
  const [quickError, setQuickError] = useState<HttpErrorInfo | null>(null)

  const currentIntegration =
    availableIntegrations.find((item) => item.id === activeIntegrationId) ||
    availableIntegrations[0]

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint)
    setQuickResponse(null)
    setQuickError(null)
  }

  const handleQuickRun = async () => {
    const req = mapEndpointToHttpRequest(currentIntegration, selectedEndpoint)
    setExecuting(true)
    setQuickResponse(null)
    setQuickError(null)

    const result = await defaultHttpClient.execute(req)
    setExecuting(false)

    if (result.success && result.response) {
      setQuickResponse(result.response)
    } else if (result.error) {
      setQuickError(result.error)
      if (result.error.rawResponse) {
        setQuickResponse(result.error.rawResponse)
      }
    }
  }

  const handleOpenInClient = () => {
    const req = mapEndpointToHttpRequest(currentIntegration, selectedEndpoint)
    onLoadIntoClient(req)
  }

  return (
    <div className="tool-container">
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Predefined APIs Explorer
          </Title>
          <Text type="secondary">
            Verified, CORS-enabled public API integrations ready to test, simulate, or import into the API Client.
          </Text>
        </div>
        <Space wrap>
          <Tag color="green" icon={<CheckCircleOutlined />}>
            CORS Guaranteed
          </Tag>
        </Space>
      </div>

      <Tabs
        activeKey={activeIntegrationId}
        onChange={(key) => {
          setActiveIntegrationId(key)
          const target = availableIntegrations.find((i) => i.id === key)
          if (target && target.endpoints.length > 0) {
            setSelectedEndpoint(target.endpoints[0])
            setQuickResponse(null)
            setQuickError(null)
          }
        }}
        items={availableIntegrations.map((integration) => ({
          key: integration.id,
          label: (
            <Space>
              <ApartmentOutlined />
              <span>{integration.name}</span>
            </Space>
          ),
        }))}
        style={{ marginTop: 12 }}
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={2}>
              <Text strong>{currentIntegration.name}</Text>
              <Text type="secondary">{currentIntegration.description}</Text>
              <Text code style={{ fontSize: 13 }}>
                Base URL: {currentIntegration.baseUrl}
              </Text>
            </Space>
          </Col>
          <Col>
            {currentIntegration.docUrl && (
              <Button
                type="link"
                href={currentIntegration.docUrl}
                target="_blank"
                icon={<LinkOutlined />}
              >
                Official Docs
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Endpoints List */}
        <Col xs={24} md={10} lg={8}>
          <Card
            title="Available Endpoints"
            className="editor-card"
            bodyStyle={{ padding: 0 }}
          >
            <List
              dataSource={currentIntegration.endpoints}
              renderItem={(endpoint) => {
                const isSelected = endpoint.id === selectedEndpoint.id
                return (
                  <List.Item
                    onClick={() => handleSelectEndpoint(endpoint)}
                    style={{
                      cursor: 'pointer',
                      padding: '12px 16px',
                      background: isSelected
                        ? 'var(--selected-item-bg, rgba(22, 119, 255, 0.08))'
                        : 'transparent',
                      borderLeft: isSelected ? '3px solid #1677ff' : '3px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ width: '100%' }}>
                      <Space style={{ marginBottom: 4 }}>
                        <Tag
                          color={METHOD_COLORS[endpoint.method]}
                          style={{ fontWeight: 700, minWidth: 50, textAlign: 'center' }}
                        >
                          {endpoint.method}
                        </Tag>
                        <Text strong>{endpoint.name}</Text>
                      </Space>
                      <div>
                        <Text code style={{ fontSize: 12 }}>
                          {endpoint.path}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>

        {/* Endpoint Inspector */}
        <Col xs={24} md={14} lg={16}>
          <Card
            title={
              <Space>
                <Tag color={METHOD_COLORS[selectedEndpoint.method]} style={{ fontWeight: 700 }}>
                  {selectedEndpoint.method}
                </Tag>
                <span>{selectedEndpoint.name}</span>
              </Space>
            }
            extra={
              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleQuickRun}
                  loading={executing}
                >
                  Quick Run
                </Button>
                <Button
                  icon={<SendOutlined />}
                  onClick={handleOpenInClient}
                >
                  Open in API Client
                </Button>
              </Space>
            }
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Target URL">
                <Text code>
                  {currentIntegration.baseUrl}
                  {selectedEndpoint.path}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedEndpoint.description}
              </Descriptions.Item>
              {selectedEndpoint.queryParams && selectedEndpoint.queryParams.length > 0 && (
                <Descriptions.Item label="Default Parameters">
                  {selectedEndpoint.queryParams.map((p) => (
                    <div key={p.key}>
                      <Text code>{p.key}</Text> = <Text>{p.value}</Text>{' '}
                      {p.description && <Text type="secondary">({p.description})</Text>}
                    </div>
                  ))}
                </Descriptions.Item>
              )}
              {selectedEndpoint.bodyTemplate && (
                <Descriptions.Item label="Body Template">
                  <pre
                    style={{
                      maxHeight: 120,
                      overflow: 'auto',
                      background: 'var(--code-bg, rgba(0, 0, 0, 0.03))',
                      padding: 8,
                      borderRadius: 4,
                      fontSize: 12,
                      margin: 0,
                    }}
                  >
                    {selectedEndpoint.bodyTemplate}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Quick Test Results */}
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Quick Run Result</Text>
              {quickResponse && (
                <Space>
                  <StatusBadge status={quickResponse.status} statusText={quickResponse.statusText} />
                  <Tag color="blue">{quickResponse.durationMs} ms</Tag>
                  <CopyButton text={quickResponse.body} size="small" />
                </Space>
              )}
            </div>

            {executing && (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <Spin />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Calling endpoint...</Text>
                </div>
              </div>
            )}

            {quickError && !executing && (
              <Alert
                type="error"
                showIcon
                message={quickError.title}
                description={quickError.message}
                style={{ marginBottom: 12 }}
              />
            )}

            {quickResponse && !executing && (
              <pre
                style={{
                  maxHeight: 280,
                  overflow: 'auto',
                  background: 'var(--code-bg, rgba(0, 0, 0, 0.03))',
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  margin: 0,
                }}
              >
                {quickResponse.isJson && quickResponse.parsedJson
                  ? JSON.stringify(quickResponse.parsedJson, null, 2)
                  : quickResponse.body}
              </pre>
            )}

            {!quickResponse && !quickError && !executing && (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <Text type="secondary">
                  Click "Quick Run" to test this endpoint instantly, or "Open in API Client" to inspect headers and parameters.
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
