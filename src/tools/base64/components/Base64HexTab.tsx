import React, { useState } from 'react'
import { Card, Button, Space, Typography, Alert, Radio, Row, Col, Input, Tag } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { hexToBase64, base64ToHex, type Base64Variant } from '@/utils/base64'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text } = Typography

type DirectionMode = 'encode' | 'decode'

interface Base64HexTabProps {
  defaultHex?: string
}

export const Base64HexTab: React.FC<Base64HexTabProps> = ({
  defaultHex = '48656c6c6f20446576466f726765',
}) => {
  const [mode, setMode] = useState<DirectionMode>('encode')
  const [input, setInput] = useState<string>(defaultHex)
  const [output, setOutput] = useState<string>(() => hexToBase64(defaultHex).result)
  const [variant] = useState<Base64Variant>('standard')
  const [padding] = useState<boolean>(true)
  const [spaceDelimited, setSpaceDelimited] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = (
    currentMode = mode,
    currentInput = input,
    currentSpaces = spaceDelimited
  ) => {
    if (!currentInput) {
      setOutput('')
      setError(null)
      return
    }

    if (currentMode === 'encode') {
      const res = hexToBase64(currentInput, { variant, padding })
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to convert Hex to Base64')
      }
    } else {
      const res = base64ToHex(currentInput, currentSpaces)
      if (res.success) {
        setOutput(res.result)
        setError(null)
      } else {
        setError(res.error || 'Failed to convert Base64 to Hex')
      }
    }
  }

  const handleSwap = () => {
    if (output && !error) {
      const newMode = mode === 'encode' ? 'decode' : 'encode'
      setMode(newMode)
      setInput(output)
      handleProcess(newMode, output, spaceDelimited)
    }
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }} size="small" className="config-card">
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12}>
            <Space size="middle" align="center">
              <Text strong>Conversion Direction:</Text>
              <Radio.Group
                value={mode}
                onChange={(e) => {
                  const m = e.target.value as DirectionMode
                  setMode(m)
                  handleProcess(m, input, spaceDelimited)
                }}
                buttonStyle="solid"
              >
                <Radio.Button value="encode">Hex ➔ Base64</Radio.Button>
                <Radio.Button value="decode">Base64 ➔ Hex</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>

          <Col xs={24} sm={12}>
            {mode === 'decode' && (
              <Space align="center">
                <Text strong>Hex Format:</Text>
                <Radio.Group
                  value={spaceDelimited}
                  size="small"
                  onChange={(e) => {
                    const sp = e.target.value
                    setSpaceDelimited(sp)
                    handleProcess(mode, input, sp)
                  }}
                >
                  <Radio.Button value={true}>Space-separated (48 65 6c)</Radio.Button>
                  <Radio.Button value={false}>Continuous (48656c)</Radio.Button>
                </Radio.Group>
              </Space>
            )}
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Hex Conversion Error"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>{mode === 'encode' ? 'Hex Input' : 'Base64 Input'}</Text>
                <Tag color={mode === 'encode' ? 'orange' : 'purple'}>
                  {input.replace(/\s/g, '').length} chars
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
                handleProcess(mode, val, spaceDelimited)
              }}
              placeholder={
                mode === 'encode'
                  ? 'Enter Hex string (e.g. 48 65 6c 6c 6f or 48656c6c6f)...'
                  : 'Paste Base64 string to convert to Hex...'
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
                <Text strong>{mode === 'encode' ? 'Base64 Output' : 'Hex Output'}</Text>
                {output && (
                  <Tag color="cyan">
                    {output.replace(/\s/g, '').length} chars
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
              rows={12}
              className="monospace-editor"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
