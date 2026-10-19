import React, { useState } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Radio,
  Row,
  Col,
  Input,
  Tag,
  Tabs,
  Switch,
  Upload,
  Descriptions,
} from 'antd'
import {
  SwapOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileTextOutlined,
  NumberOutlined,
} from '@ant-design/icons'
import {
  encodeBase64Utf8,
  decodeBase64Utf8,
  hexToBase64,
  base64ToHex,
  extractCleanBase64,
  detectMimeTypeFromBytes,
  type Base64Variant,
  type Base64LineWrap,
} from '@/utils/base64'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text, Title } = Typography
const { Dragger } = Upload

type ToolTab = 'text' | 'file' | 'hex'
type DirectionMode = 'encode' | 'decode'

const DEFAULT_TEXT = 'Xin chào Việt Nam! 🇻🇳 DevForge rocks 🚀'
const DEFAULT_HEX = '48656c6c6f20446576466f726765' // "Hello DevForge"

export const Base64Tool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('text')

  // Text Mode States
  const [textMode, setTextMode] = useState<DirectionMode>('encode')
  const [textInput, setTextInput] = useState<string>(DEFAULT_TEXT)
  const [textOutput, setTextOutput] = useState<string>(() => encodeBase64Utf8(DEFAULT_TEXT).result)
  const [variant, setVariant] = useState<Base64Variant>('standard')
  const [padding, setPadding] = useState<boolean>(true)
  const [lineWrap, setLineWrap] = useState<Base64LineWrap>(0)
  const [textError, setTextError] = useState<string | null>(null)

  // Hex Mode States
  const [hexMode, setHexMode] = useState<DirectionMode>('encode')
  const [hexInput, setHexInput] = useState<string>(DEFAULT_HEX)
  const [hexOutput, setHexOutput] = useState<string>(() => hexToBase64(DEFAULT_HEX).result)
  const [hexSpaceDelimited, setHexSpaceDelimited] = useState<boolean>(true)
  const [hexError, setHexError] = useState<string | null>(null)

  // File / Data URL Mode States
  const [fileDataUrl, setFileDataUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [fileMime, setFileMime] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [fileDecodeInput, setFileDecodeInput] = useState<string>('')
  const [fileError, setFileError] = useState<string | null>(null)

  // --- Handlers for Text Mode ---
  const handleProcessText = (
    currentMode = textMode,
    currentInput = textInput,
    currentVariant = variant,
    currentPadding = padding,
    currentWrap = lineWrap
  ) => {
    if (!currentInput) {
      setTextOutput('')
      setTextError(null)
      return
    }

    if (currentMode === 'encode') {
      const res = encodeBase64Utf8(currentInput, {
        variant: currentVariant,
        padding: currentPadding,
        lineWrap: currentWrap,
      })
      if (res.success) {
        setTextOutput(res.result)
        setTextError(null)
      } else {
        setTextError(res.error || 'Failed to encode')
      }
    } else {
      const res = decodeBase64Utf8(currentInput, { variant: 'auto' })
      if (res.success) {
        setTextOutput(res.result)
        setTextError(null)
      } else {
        setTextError(res.error || 'Failed to decode')
      }
    }
  }

  const handleSwapText = () => {
    if (textOutput && !textError) {
      const newMode = textMode === 'encode' ? 'decode' : 'encode'
      setTextMode(newMode)
      setTextInput(textOutput)
      handleProcessText(newMode, textOutput, variant, padding, lineWrap)
    }
  }

  // --- Handlers for Hex Mode ---
  const handleProcessHex = (
    currentMode = hexMode,
    currentInput = hexInput,
    currentVariant = variant,
    currentPadding = padding,
    currentSpaces = hexSpaceDelimited
  ) => {
    if (!currentInput) {
      setHexOutput('')
      setHexError(null)
      return
    }

    if (currentMode === 'encode') {
      const res = hexToBase64(currentInput, { variant: currentVariant, padding: currentPadding })
      if (res.success) {
        setHexOutput(res.result)
        setHexError(null)
      } else {
        setHexError(res.error || 'Failed to convert Hex to Base64')
      }
    } else {
      const res = base64ToHex(currentInput, currentSpaces)
      if (res.success) {
        setHexOutput(res.result)
        setHexError(null)
      } else {
        setHexError(res.error || 'Failed to convert Base64 to Hex')
      }
    }
  }

  // --- Handlers for File Mode ---
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setFileDataUrl(dataUrl)
      setFileName(file.name)
      setFileMime(file.type || 'application/octet-stream')
      setFileSize(file.size)
      setFileError(null)
    }
    reader.onerror = () => {
      setFileError('Failed to read file')
    }
    reader.readAsDataURL(file)
    return false // prevent default upload dispatch
  }

  const getCleanFileBase64 = () => {
    if (!fileDataUrl) return ''
    return extractCleanBase64(fileDataUrl).clean
  }

  const handleDownloadDecoded = () => {
    if (!fileDecodeInput) return
    const { clean, dataUrlMime } = extractCleanBase64(fileDecodeInput)
    try {
      const binary = atob(clean.replace(/-/g, '+').replace(/_/g, '/'))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const mime = dataUrlMime || detectMimeTypeFromBytes(bytes) || 'application/octet-stream'
      const blob = new Blob([bytes], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const extension = mime.split('/')[1]?.replace('+xml', '') || 'bin'
      a.download = `decoded-${Date.now()}.${extension}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setFileError(err instanceof Error ? err.message : 'Failed to download binary file')
    }
  }

  // Preview decoded file
  const getDecodedPreviewUrl = () => {
    if (!fileDecodeInput) return null
    const { clean, dataUrlMime } = extractCleanBase64(fileDecodeInput)
    try {
      const binary = atob(clean.replace(/-/g, '+').replace(/_/g, '/'))
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const mime = dataUrlMime || detectMimeTypeFromBytes(bytes) || 'image/png'
      if (mime.startsWith('image/')) {
        return `data:${mime};base64,${clean}`
      }
      return null
    } catch {
      return null
    }
  }

  const imagePreviewUrl = getDecodedPreviewUrl()

  return (
    <div className="tool-container">
      {/* Header bar */}
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Base64 Multi-Format Suite
          </Title>
          <Text type="secondary">
            Comprehensive Base64 toolkit supporting UTF-8 Text, Base64URL (RFC 4648 §5), Hex Bytes, and File/Image Data URLs.
          </Text>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="Data Representation Notice"
        description="Base64 converts binary and text data into safe ASCII characters for storage or transmission. It is NOT cryptographic encryption."
        style={{ margin: '14px 0' }}
      />

      <Tabs
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k as ToolTab)}
        type="card"
        items={[
          {
            key: 'text',
            label: (
              <Space>
                <FileTextOutlined />
                <span>Text / String (UTF-8)</span>
              </Space>
            ),
          },
          {
            key: 'file',
            label: (
              <Space>
                <FileImageOutlined />
                <span>File & Image (Data URL)</span>
              </Space>
            ),
          },
          {
            key: 'hex',
            label: (
              <Space>
                <NumberOutlined />
                <span>Hex Bytes ➔ Base64</span>
              </Space>
            ),
          },
        ]}
      />

      {/* ================= TAB 1: TEXT MODE ================= */}
      {activeTab === 'text' && (
        <div>
          <Card style={{ marginBottom: 16 }} size="small" className="config-card">
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} md={8}>
                <Space size="middle" align="center">
                  <Text strong>Mode:</Text>
                  <Radio.Group
                    value={textMode}
                    onChange={(e) => {
                      const m = e.target.value as DirectionMode
                      setTextMode(m)
                      handleProcessText(m, textInput, variant, padding, lineWrap)
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
                        handleProcessText(textMode, textInput, v, padding, lineWrap)
                      }}
                    >
                      <Radio.Button value="standard">Standard (+, /)</Radio.Button>
                      <Radio.Button value="base64url">Base64URL (-, _)</Radio.Button>
                    </Radio.Group>
                  </Space>

                  {textMode === 'encode' && (
                    <Space align="center">
                      <Text strong>Padding (=):</Text>
                      <Switch
                        checked={padding}
                        size="small"
                        onChange={(p) => {
                          setPadding(p)
                          handleProcessText(textMode, textInput, variant, p, lineWrap)
                        }}
                      />
                    </Space>
                  )}

                  {textMode === 'encode' && (
                    <Space align="center">
                      <Text strong>Line Wrap:</Text>
                      <Radio.Group
                        value={lineWrap}
                        size="small"
                        onChange={(e) => {
                          const w = e.target.value as Base64LineWrap
                          setLineWrap(w)
                          handleProcessText(textMode, textInput, variant, padding, w)
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

          {textError && (
            <Alert
              type="error"
              showIcon
              message="Processing Error"
              description={textError}
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <Text strong>{textMode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}</Text>
                    <Tag color={textMode === 'encode' ? 'blue' : 'purple'}>
                      {textInput.length} chars
                    </Tag>
                  </Space>
                }
                extra={
                  <Button size="small" icon={<SwapOutlined />} onClick={handleSwapText}>
                    Swap
                  </Button>
                }
                className="editor-card"
              >
                <TextArea
                  value={textInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setTextInput(val)
                    handleProcessText(textMode, val, variant, padding, lineWrap)
                  }}
                  placeholder={
                    textMode === 'encode'
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
                    <Text strong>{textMode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</Text>
                    {textOutput && (
                      <Tag color="cyan">
                        {textOutput.length} chars
                        {textMode === 'encode' && textInput && (
                          <span style={{ marginLeft: 4 }}>
                            (+{Math.round(((textOutput.length - textInput.length) / Math.max(1, textInput.length)) * 100)}%)
                          </span>
                        )}
                      </Tag>
                    )}
                  </Space>
                }
                extra={<CopyButton text={textOutput} size="small" />}
                className="editor-card"
              >
                <TextArea
                  value={textOutput}
                  readOnly
                  placeholder="Result will appear automatically here..."
                  rows={14}
                  className="monospace-editor"
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* ================= TAB 2: FILE & IMAGE (DATA URL) ================= */}
      {activeTab === 'file' && (
        <div>
          <Row gutter={[16, 16]}>
            {/* File Encoder Section */}
            <Col xs={24} lg={12}>
              <Card title="File / Image ➔ Base64 & Data URL">
                <Dragger
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                  style={{ padding: '20px 0', marginBottom: 16 }}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined style={{ fontSize: 32, color: '#1677ff' }} />
                  </p>
                  <p className="ant-upload-text">Click or drag image / file to encode</p>
                  <p className="ant-upload-hint">
                    PNG, JPG, GIF, SVG, PDF, or any binary file up to 10MB
                  </p>
                </Dragger>

                {fileDataUrl && (
                  <div>
                    <Descriptions size="small" bordered column={1} style={{ marginBottom: 12 }}>
                      <Descriptions.Item label="File Name">{fileName}</Descriptions.Item>
                      <Descriptions.Item label="MIME Type">
                        <Tag color="geekblue">{fileMime}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="File Size">
                        {(fileSize / 1024).toFixed(1)} KB (Base64: {(fileDataUrl.length / 1024).toFixed(1)} KB)
                      </Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <CopyButton text={getCleanFileBase64()} label="Copy Raw Base64" size="small" />
                      <CopyButton text={fileDataUrl} label="Copy Data URL" type="primary" size="small" />
                      <CopyButton
                        text={`<img src="${fileDataUrl}" alt="${fileName}" />`}
                        label="Copy HTML <img> Tag"
                        size="small"
                      />
                    </div>

                    <TextArea
                      value={fileDataUrl}
                      readOnly
                      rows={8}
                      className="monospace-editor"
                    />
                  </div>
                )}
              </Card>
            </Col>

            {/* Base64 to Image / File Decoder Section */}
            <Col xs={24} lg={12}>
              <Card
                title="Base64 ➔ Preview & Download File"
                extra={
                  fileDecodeInput && (
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      size="small"
                      onClick={handleDownloadDecoded}
                    >
                      Download File
                    </Button>
                  )
                }
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong>Paste Base64 or Data URL:</Text>
                  <TextArea
                    value={fileDecodeInput}
                    onChange={(e) => {
                      setFileDecodeInput(e.target.value)
                      setFileError(null)
                    }}
                    placeholder="Paste data:image/png;base64,... or raw base64 string here..."
                    rows={6}
                    className="monospace-editor"
                    style={{ marginTop: 6 }}
                  />
                </div>

                {fileError && (
                  <Alert
                    type="error"
                    showIcon
                    message={fileError}
                    style={{ marginBottom: 12 }}
                  />
                )}

                {imagePreviewUrl ? (
                  <div style={{ textAlign: 'center', padding: 16, background: 'var(--code-bg, rgba(0,0,0,0.02))', borderRadius: 8 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      Image Live Preview
                    </Text>
                    <img
                      src={imagePreviewUrl}
                      alt="Decoded Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                  </div>
                ) : (
                  fileDecodeInput && (
                    <Alert
                      type="info"
                      showIcon
                      message="Binary Data Detected"
                      description="Click 'Download File' above to save the binary payload to your computer."
                    />
                  )
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* ================= TAB 3: HEX <-> BASE64 ================= */}
      {activeTab === 'hex' && (
        <div>
          <Card style={{ marginBottom: 16 }} size="small" className="config-card">
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} sm={12}>
                <Space size="middle" align="center">
                  <Text strong>Conversion Direction:</Text>
                  <Radio.Group
                    value={hexMode}
                    onChange={(e) => {
                      const m = e.target.value as DirectionMode
                      setHexMode(m)
                      handleProcessHex(m, hexInput, variant, padding, hexSpaceDelimited)
                    }}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="encode">Hex ➔ Base64</Radio.Button>
                    <Radio.Button value="decode">Base64 ➔ Hex</Radio.Button>
                  </Radio.Group>
                </Space>
              </Col>

              <Col xs={24} sm={12}>
                {hexMode === 'decode' && (
                  <Space align="center">
                    <Text strong>Hex Format:</Text>
                    <Radio.Group
                      value={hexSpaceDelimited}
                      size="small"
                      onChange={(e) => {
                        const sp = e.target.value
                        setHexSpaceDelimited(sp)
                        handleProcessHex(hexMode, hexInput, variant, padding, sp)
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

          {hexError && (
            <Alert
              type="error"
              showIcon
              message="Hex Conversion Error"
              description={hexError}
              style={{ marginBottom: 16 }}
            />
          )}

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <Text strong>{hexMode === 'encode' ? 'Hex Input' : 'Base64 Input'}</Text>
                    <Tag color={hexMode === 'encode' ? 'orange' : 'purple'}>
                      {hexInput.replace(/\s/g, '').length} chars
                    </Tag>
                  </Space>
                }
                extra={
                  <Button
                    size="small"
                    icon={<SwapOutlined />}
                    onClick={() => {
                      if (hexOutput && !hexError) {
                        const newMode = hexMode === 'encode' ? 'decode' : 'encode'
                        setHexMode(newMode)
                        setHexInput(hexOutput)
                        handleProcessHex(newMode, hexOutput, variant, padding, hexSpaceDelimited)
                      }
                    }}
                  >
                    Swap
                  </Button>
                }
                className="editor-card"
              >
                <TextArea
                  value={hexInput}
                  onChange={(e) => {
                    const val = e.target.value
                    setHexInput(val)
                    handleProcessHex(hexMode, val, variant, padding, hexSpaceDelimited)
                  }}
                  placeholder={
                    hexMode === 'encode'
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
                    <Text strong>{hexMode === 'encode' ? 'Base64 Output' : 'Hex Output'}</Text>
                    {hexOutput && (
                      <Tag color="cyan">
                        {hexOutput.replace(/\s/g, '').length} chars
                      </Tag>
                    )}
                  </Space>
                }
                extra={<CopyButton text={hexOutput} size="small" />}
                className="editor-card"
              >
                <TextArea
                  value={hexOutput}
                  readOnly
                  placeholder="Result will appear automatically here..."
                  rows={12}
                  className="monospace-editor"
                />
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  )
}
