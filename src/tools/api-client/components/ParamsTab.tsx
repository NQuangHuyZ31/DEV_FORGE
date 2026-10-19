import React from 'react'
import { Button, Checkbox, Input, Typography, Empty } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { KeyValuePair } from '@/types/http'

const { Text } = Typography

interface ParamsTabProps {
  params: KeyValuePair[]
  onParamsChange: (params: KeyValuePair[]) => void
}

export const ParamsTab: React.FC<ParamsTabProps> = ({ params, onParamsChange }) => {
  const addParam = () => {
    onParamsChange([
      ...params,
      { id: String(Date.now()), key: '', value: '', enabled: true },
    ])
  }

  const updateParam = (id: string, field: keyof KeyValuePair, value: any) => {
    onParamsChange(params.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const deleteParam = (id: string) => {
    onParamsChange(params.filter((p) => p.id !== id))
  }

  return (
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
  )
}
