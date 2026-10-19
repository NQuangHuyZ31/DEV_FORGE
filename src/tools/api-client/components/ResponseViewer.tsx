import React, { useState } from 'react'
import { Card, Space, Typography, Tag, Radio, Tooltip, Button, Spin, Alert, Tabs, Empty, Input } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import type { HttpResponse, HttpErrorInfo } from '@/types/http'
import { StatusBadge } from '@/components/common/StatusBadge'
import { CopyButton } from '@/components/common/CopyButton'

const { Text, Paragraph } = Typography
const { TextArea } = Input

interface ResponseViewerProps {
  loading: boolean
  response: HttpResponse | null
  errorInfo: HttpErrorInfo | null
  onOpenCorsGuide: () => void
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  loading,
  response,
  errorInfo,
  onOpenCorsGuide,
}) => {
  const [rawView, setRawView] = useState<boolean>(false)

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
                  onClick={onOpenCorsGuide}
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
  )
}
