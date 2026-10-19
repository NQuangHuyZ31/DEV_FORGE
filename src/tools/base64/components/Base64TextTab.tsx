import React, { useState } from 'react'
import { Card, Button, Space, Typography, Alert, Radio, Row, Col, Input, Tag, Switch } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import {
  encodeBase64Utf8,
  decodeBase64Utf8,
  type Base64Variant,
  type Base64LineWrap,
} from '@/utils/base64'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text } = Typography

type DirectionMode = 'encode' | 'decode'

interface Base64TextTabProps {
  defaultInput?: string
}

export const Base64TextTab: React.FC<Base64TextTabProps> = ({
  defaultInput = 'Xin chào Việt Nam! 🇻🇳 DevForge rocks 🚀',
}) => {
  const [mode, setMode] = useState<DirectionMode>('encode')
  const [input, setInput] = useState<string>(defaultInput)
  const [output, setOutput] = useState<string>(() => encodeBase64Utf8(defaultInput).result)
  const [variant, setVariant] = useState<Base64Variant>('standard')
  const [padding, setPadding] = useState<boolean>(true)
  const [lineWrap, setLineWrap] = useState<Base64LineWrap>(0)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = (
    currentMode = mode,
    currentInput = input,
    currentVariant = variant,
    currentPadding = padding,
    currentWrap = lineWrap
  ) => {
    if (!currentInput) {
      setOutput('')
      setError(null)
      return
    }

    if (currentMode === 'encode') {
      const res = encodeBase64Utf8(currentInput, {
        variant: currentVariant,
        padding: currentPadding,
        lineWrap: currentWrap,
      })
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to encode')
      }
    } else {
      const res = decodeBase64Utf8(currentInput, { variant: 'auto' })
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to decode')
      }
    }
  }

  const handleSwap = () => {
    if (output && !error) {
      const newMode = mode === 'encode' ? 'decode' : 'encode'
      setMode(newMode)
      setInput(output)
      handleProcess(newMode, output, variant, padding, lineWrap)
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }} size="small" className="config-card">
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} md={8}>
            <Space size="middle" align="center">
              <Text strong>Mode:</Text>
              <Radio.Group
                value={mode}
                onChange={(e) => {
                  const m = e.target.value as DirectionMode
                  setMode(m)
                  handleProcess(m, input, variant, padding, lineWrap)
                }}
                buttonStyle="solid"
              >
                <Radio.Button value="encode">Encode</Radio.Button>
                <Radio.Button value="decode">Decode</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>

          <Col xs={24} md={16}>
            <Space wrap size="middle">
              <Space align="center">
                <Text strong>Variant:</Text>
                <Radio.Group
                  value={variant}
                  size="small"
                  onChange={(e) => {
                    const v = e.target.value as Base64Variant
                    setVariant(v)
                    handleProcess(mode, input, v, padding, lineWrap)
                  }}
                >
                  <Radio.Button value="standard">Standard (+, /)</Radio.Button>
                  <Radio.Button value="base64url">Base64URL (-, _)</Radio.Button>
                </Radio.Group>
              </Space>

              {mode === 'encode' && (
                <Space align="center">
                  <Text strong>Padding (=):</Text>
                  <Switch
                    checked={padding}
                    size="small"
                    onChange={(p) => {
                      setPadding(p)
                      handleProcess(mode, input, variant, p, lineWrap)
                    }}
                  />
                </Space>
              )}

              {mode === 'encode' && (
                <Space align="center">
                  <Text strong>Line Wrap:</Text>
                  <Radio.Group
                    value={lineWrap}
                    size="small"
                    onChange={(e) => {
                      const w = e.target.value as Base64LineWrap
                      setLineWrap(w)
                      handleProcess(mode, input, variant, padding, w)
                    }}
                  >
                    <Radio.Button value={0}>None</Radio.Button>
                    <Radio.Button value={64}>64 (PEM)</Radio.Button>
                    <Radio.Button value={76}>76 (MIME)</Radio.Button>
                  </Radio.Group>
                </Space>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Processing Error"
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
                  {input.length} chars
                </Tag>
              </Space>
            }
            extra={
              <Button size="small" icon={<SwapOutlined />} onClick={handleSwap}>
                Swap
              </Button>
            }
            className="editor-card"
          >
            <TextArea
              value={input}
              onChange={(e) => {
                const val = e.target.value
                setInput(val)
                handleProcess(mode, val, variant, padding, lineWrap)
              }}
              placeholder={
                mode === 'encode'
                  ? 'Enter text, Vietnamese accents, or emoji to encode...'
                  : 'Paste Base64 or Base64URL string...'
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
                <Text strong>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</Text>
                {output && (
                  <Tag color="cyan">
                    {output.length} chars
                    {mode === 'encode' && input && (
                      <span style={{ marginLeft: 4 }}>
                        (+{Math.round(((output.length - input.length) / Math.max(1, input.length)) * 100)}%)
                      </span>
                    )}
                  </Tag>
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
