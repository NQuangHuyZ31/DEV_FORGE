import React from 'react'
import { Card, Space, Select, Input, Button, Tag, Tooltip, Typography } from 'antd'
import { SendOutlined, StopOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { HttpMethod } from '@/types/http'

const { Text } = Typography

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#1677ff',
  POST: '#52c41a',
  PUT: '#fa8c16',
  PATCH: '#722ed1',
  DELETE: '#f5222d',
}

interface RequestUrlBarProps {
  method: HttpMethod
  onMethodChange: (m: HttpMethod) => void
  url: string
  onUrlChange: (url: string) => void
  loading: boolean
  onSend: () => void
  onCancel: () => void
  useProxy: boolean
  onUseProxyChange: (useProxy: boolean) => void
}

export const RequestUrlBar: React.FC<RequestUrlBarProps> = ({
  method,
  onMethodChange,
  url,
  onUrlChange,
  loading,
  onSend,
  onCancel,
  useProxy,
  onUseProxyChange,
}) => {
  return (
    <Card style={{ margin: '16px 0' }} className="url-bar-card">
      <Space.Compact style={{ width: '100%' }}>
        <Select
          value={method}
          onChange={(val) => onMethodChange(val as HttpMethod)}
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
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Enter request URL (e.g. https://jsonplaceholder.typicode.com/posts)"
          onPressEnter={onSend}
          style={{ fontFamily: 'monospace' }}
        />
        {loading ? (
          <Button
            type="primary"
            danger
            icon={<StopOutlined />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSend}
            style={{ background: METHOD_COLORS[method], borderColor: METHOD_COLORS[method] }}
          >
            Send
          </Button>
        )}
      </Space.Compact>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
        <Space size="small">
          <Tooltip title="Bật CORS Proxy để vượt qua chính sách bảo mật CORS của trình duyệt, hỗ trợ gọi thành công mọi API public hoặc local backend.">
            <Tag.CheckableTag
              checked={useProxy}
              onChange={onUseProxyChange}
              style={{
                borderRadius: 4,
                padding: '2px 10px',
                border: useProxy ? '1px solid #722ed1' : '1px solid rgba(255, 255, 255, 0.15)',
                background: useProxy ? 'rgba(114, 46, 209, 0.25)' : 'transparent',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              <ThunderboltOutlined style={{ color: useProxy ? '#722ed1' : '#8c8c8c', marginRight: 5 }} />
              {useProxy ? 'CORS Proxy: ĐANG BẬT (Bypass CORS)' : 'CORS Proxy: TẮT (Direct Browser)'}
            </Tag.CheckableTag>
          </Tooltip>
        </Space>
        {useProxy && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            ⚡ Request được định tuyến qua Proxy để bỏ qua kiểm tra Same-Origin của trình duyệt.
          </Text>
        )}
      </div>
    </Card>
  )
}
