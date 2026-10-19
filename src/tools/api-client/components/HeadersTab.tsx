import React from 'react'
import { Button, Checkbox, Input, Typography, Empty } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { KeyValuePair } from '@/types/http'

const { Text } = Typography

interface HeadersTabProps {
  headers: KeyValuePair[]
  onHeadersChange: (headers: KeyValuePair[]) => void
}

export const HeadersTab: React.FC<HeadersTabProps> = ({ headers, onHeadersChange }) => {
  const addHeader = () => {
    onHeadersChange([
      ...headers,
      { id: String(Date.now()), key: '', value: '', enabled: true },
    ])
  }

  const updateHeader = (id: string, field: keyof KeyValuePair, value: any) => {
    onHeadersChange(headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)))
  }

  const deleteHeader = (id: string) => {
    onHeadersChange(headers.filter((h) => h.id !== id))
  }

  return (
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
  )
}
