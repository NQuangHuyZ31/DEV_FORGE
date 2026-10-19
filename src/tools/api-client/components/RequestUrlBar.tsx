import React from 'react'
import { Card, Space, Select, Input, Button } from 'antd'
import { SendOutlined, StopOutlined } from '@ant-design/icons'
import type { HttpMethod } from '@/types/http'

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
}

export const RequestUrlBar: React.FC<RequestUrlBarProps> = ({
  method,
  onMethodChange,
  url,
  onUrlChange,
  loading,
  onSend,
  onCancel,
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
    </Card>
  )
}
