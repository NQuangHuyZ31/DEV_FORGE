import React from 'react'
import { Space, Typography, Radio, Button, Alert, Empty, Input } from 'antd'
import { CodeOutlined, WarningOutlined } from '@ant-design/icons'
import type { BodyType, HttpMethod } from '@/types/http'
import { formatJson } from '@/utils/json'

const { Text } = Typography
const { TextArea } = Input

interface BodyTabProps {
  method: HttpMethod
  bodyType: BodyType
  onBodyTypeChange: (type: BodyType) => void
  bodyContent: string
  onBodyContentChange: (content: string) => void
}

export const BodyTab: React.FC<BodyTabProps> = ({
  method,
  bodyType,
  onBodyTypeChange,
  bodyContent,
  onBodyContentChange,
}) => {
  const handleFormatBody = () => {
    const res = formatJson(bodyContent, 2)
    if (res.success) {
      onBodyContentChange(res.result)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Space size="middle">
          <Text strong>Body Type:</Text>
          <Radio.Group
            value={bodyType}
            onChange={(e) => onBodyTypeChange(e.target.value as BodyType)}
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
          onChange={(e) => onBodyContentChange(e.target.value)}
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
  )
}
