import React, { useState } from 'react'
import { Card, Button, Space, Typography, Alert, Radio, Row, Col, Input, Tag } from 'antd'
import {
  ClearOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { encodeBase64Utf8, decodeBase64Utf8 } from '@/utils/base64'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text, Title } = Typography

type Mode = 'encode' | 'decode'

const DEFAULT_BASE64_INPUT = 'Xin chào Việt Nam! 🇻🇳 DevForge rocks 🚀'

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState<string>(DEFAULT_BASE64_INPUT)
  const [output, setOutput] = useState<string>(() => encodeBase64Utf8(DEFAULT_BASE64_INPUT).result)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = (overrideMode?: Mode, overrideInput?: string) => {
    const currentMode = overrideMode ?? mode
    const currentText = overrideInput ?? input

    if (!currentText) {
      setOutput('')
      setError(null)
      return
    }

    if (currentMode === 'encode') {
      const res = encodeBase64Utf8(currentText)
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to encode')
      }
    } else {
      const res = decodeBase64Utf8(currentText)
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to decode')
      }
    }
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    // Swap input with previous output if available
    if (output && !error) {
      setInput(output)
      handleProcess(newMode, output)
    } else {
      handleProcess(newMode, input)
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
            Base64 Encoder & Decoder
          </Title>
          <Text type="secondary">
            Encode and decode Base64 data with full UTF-8 Unicode support (Vietnamese accents & emoji safe).
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ClearOutlined />} onClick={handleClear} danger>
            Clear
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="Data Representation Notice"
        description="Base64 is a binary-to-text encoding format designed to safely transmit data across text-only protocols. It is NOT cryptographic encryption and should not be used to protect secrets."
        style={{ margin: '16px 0' }}
      />

      <div style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Text strong>Operation Mode:</Text>
          <Radio.Group
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as Mode)}
            buttonStyle="solid"
          >
            <Radio.Button value="encode">Encode (Text ➔ Base64)</Radio.Button>
            <Radio.Button value="decode">Decode (Base64 ➔ Text)</Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => handleProcess()}
          >
            {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Base64 Processing Error"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>{mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</Text>
                <Tag color={mode === 'encode' ? 'blue' : 'purple'}>
                  {mode === 'encode' ? 'UTF-8 String' : 'Base64'}
                </Tag>
              </Space>
            }
            className="editor-card"
          >
            <TextArea
              value={input}
              onChange={(e) => {
                const val = e.target.value
                setInput(val)
                handleProcess(mode, val)
              }}
              placeholder={
                mode === 'encode'
                  ? 'Enter text, Vietnamese accents, or emoji to encode...'
                  : 'Paste Base64 string to decode...'
              }
              rows={14}
              className="monospace-editor"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text Output'}</Text>
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
              rows={14}
              className="monospace-editor"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
