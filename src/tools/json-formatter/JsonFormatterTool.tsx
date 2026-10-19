import React, { useState } from 'react'
import { Card, Button, Space, Typography, Alert, Radio, Row, Col, Input } from 'antd'
import {
  ClearOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { formatJson, validateJson, type IndentOption } from '@/utils/json'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text, Title } = Typography

const SAMPLE_JSON = `{
  "name": "DevForge",
  "version": "1.0.0",
  "description": "Developer utility suite & REST API cockpit",
  "tools": [
    "JSON Formatter",
    "Base64 Encoder/Decoder",
    "UUID Generator",
    "Timestamp Converter",
    "URL Encoder/Decoder",
    "API Client"
  ],
  "settings": {
    "offlineReady": true,
    "darkMode": true,
    "security": {
      "corsEnforced": true,
      "inMemoryOnly": true
    }
  }
}`

export const JsonFormatterTool: React.FC = () => {
  const [input, setInput] = useState<string>(SAMPLE_JSON)
  const [output, setOutput] = useState<string>('')
  const [indent, setIndent] = useState<IndentOption>(2)
  const [errorInfo, setErrorInfo] = useState<{ message: string; line?: number; column?: number } | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleFormat = (overrideIndent?: IndentOption) => {
    const selectedIndent = overrideIndent ?? indent
    const res = formatJson(input, selectedIndent)
    if (res.success) {
      setOutput(res.result)
      setErrorInfo(null)
      setIsValid(true)
    } else {
      setOutput(res.result) // Keeps input intact as required
      setErrorInfo({
        message: res.error || 'Syntax Error',
        line: res.line,
        column: res.column,
      })
      setIsValid(false)
    }
  }

  const handleValidate = () => {
    const res = validateJson(input)
    if (res.isValid) {
      setIsValid(true)
      setErrorInfo(null)
    } else {
      setIsValid(false)
      setErrorInfo({
        message: res.error || 'Invalid JSON syntax',
        line: res.line,
        column: res.column,
      })
    }
  }

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON)
    const res = formatJson(SAMPLE_JSON, indent)
    setOutput(res.result)
    setErrorInfo(null)
    setIsValid(true)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setErrorInfo(null)
    setIsValid(null)
  }

  return (
    <div className="tool-container">
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            JSON Formatter & Validator
          </Title>
          <Text type="secondary">
            Inspect, validate syntax, beautify or compact JSON with zero server roundtrips.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<FileTextOutlined />} onClick={handleLoadSample}>
            Load Sample
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear} danger>
            Clear
          </Button>
        </Space>
      </div>

      <div style={{ margin: '16px 0' }}>
        <Space wrap size="middle">
          <Text strong>Indentation:</Text>
          <Radio.Group
            value={indent}
            onChange={(e) => {
              const val = e.target.value as IndentOption
              setIndent(val)
              if (input) handleFormat(val)
            }}
          >
            <Radio.Button value={2}>2 Spaces</Radio.Button>
            <Radio.Button value={4}>4 Spaces</Radio.Button>
            <Radio.Button value="minified">Minify / Compact</Radio.Button>
          </Radio.Group>

          <Button type="primary" icon={<CodeOutlined />} onClick={() => handleFormat()}>
            Format JSON
          </Button>
          <Button icon={<CheckCircleOutlined />} onClick={handleValidate}>
            Validate Syntax
          </Button>
        </Space>
      </div>

      {errorInfo && (
        <Alert
          type="error"
          showIcon
          message="JSON Syntax Error"
          description={
            <div>
              <Text>{errorInfo.message}</Text>
              {errorInfo.line && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    Error located near Line {errorInfo.line}, Column {errorInfo.column}
                  </Text>
                </div>
              )}
            </div>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {isValid === true && !errorInfo && (
        <Alert
          type="success"
          showIcon
          message="Valid JSON"
          description="The JSON syntax is completely valid and follows RFC 8259."
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>Input JSON</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({input.length} chars)
                </Text>
              </Space>
            }
            extra={
              <Button size="small" onClick={() => setInput(output)} disabled={!output}>
                Use Formatted as Input
              </Button>
            }
            className="editor-card"
          >
            <TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw JSON here..."
              rows={16}
              className="monospace-editor"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>Formatted Result</Text>
                {output && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ({output.length} chars)
                  </Text>
                )}
              </Space>
            }
            extra={
              <Space>
                <CopyButton text={output} size="small" />
              </Space>
            }
            className="editor-card"
          >
            <TextArea
              value={output}
              readOnly
              placeholder="Formatted output will appear here..."
              rows={16}
              className="monospace-editor"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
