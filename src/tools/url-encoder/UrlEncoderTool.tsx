import React, { useState } from 'react'
import { Card, Button, Space, Typography, Alert, Radio, Row, Col, Input } from 'antd'
import { ClearOutlined, LinkOutlined } from '@ant-design/icons'
import { encodeUrl, decodeUrl, type UrlEncodeMode } from '@/utils/url'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text, Title } = Typography

type ActionType = 'encode' | 'decode'

const DEFAULT_INPUT =
  'https://api.devforge.dev/search?q=lập trình viên&category=công cụ&lang=vi 🇻🇳'

export const UrlEncoderTool: React.FC = () => {
  const [action, setAction] = useState<ActionType>('encode')
  const [mode, setMode] = useState<UrlEncodeMode>('component')
  const [input, setInput] = useState<string>(DEFAULT_INPUT)
  const [output, setOutput] = useState<string>(() => encodeUrl(DEFAULT_INPUT, 'component').result)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = (
    currentAction: ActionType = action,
    currentMode: UrlEncodeMode = mode,
    currentText: string = input
  ) => {
    if (!currentText) {
      setOutput('')
      setError(null)
      return
    }

    if (currentAction === 'encode') {
      const res = encodeUrl(currentText, currentMode)
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to encode URL')
      }
    } else {
      const res = decodeUrl(currentText, currentMode)
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to decode URL')
      }
    }
  }

  const handleActionChange = (newAction: ActionType) => {
    setAction(newAction)
    if (output && !error) {
      setInput(output)
      handleProcess(newAction, mode, output)
    } else {
      handleProcess(newAction, mode, input)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="tool-container">
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            URL Encoder & Decoder
          </Title>
          <Text type="secondary">
            Safely percent-encode and decode URL components and complete URLs with full Unicode support.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ClearOutlined />} onClick={handleClear} danger>
            Clear
          </Button>
        </Space>
      </div>

      <div style={{ margin: '16px 0' }}>
        <Space size="middle" wrap>
          <Text strong>Operation:</Text>
          <Radio.Group
            value={action}
            onChange={(e) => handleActionChange(e.target.value as ActionType)}
            buttonStyle="solid"
          >
            <Radio.Button value="encode">Encode URL</Radio.Button>
            <Radio.Button value="decode">Decode URL</Radio.Button>
          </Radio.Group>

          <Text strong style={{ marginLeft: 8 }}>
            Encoding Scope:
          </Text>
          <Radio.Group
            value={mode}
            onChange={(e) => {
              const newMode = e.target.value as UrlEncodeMode
              setMode(newMode)
              handleProcess(action, newMode, input)
            }}
          >
            <Radio.Button value="component">
              Component (encodeURIComponent)
            </Radio.Button>
            <Radio.Button value="full">
              Full URL (encodeURI)
            </Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="URL Processing Error"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LinkOutlined />
                <Text strong>{action === 'encode' ? 'Raw URL / Text' : 'Encoded String'}</Text>
              </Space>
            }
            className="editor-card"
          >
            <TextArea
              value={input}
              onChange={(e) => {
                const val = e.target.value
                setInput(val)
                handleProcess(action, mode, val)
              }}
              placeholder={
                action === 'encode'
                  ? 'Paste raw URL or query text...'
                  : 'Paste percent-encoded URL (e.g. %20, %E1%BA%A1)...'
              }
              rows={12}
              className="monospace-editor"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>{action === 'encode' ? 'Encoded Output' : 'Decoded Output'}</Text>
                {output && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({output.length} characters)
                  </Text>
                )}
              </Space>
            }
            extra={<CopyButton text={output} size="small" />}
            className="editor-card"
          >
            <TextArea
              value={output}
              readOnly
              placeholder="Result will appear automatically here..."
              rows={12}
              className="monospace-editor"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
