import React, { useState } from 'react'
import { Card, Button, Row, Col, Input, Tag, Upload, Descriptions, Alert, Typography } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { extractCleanBase64, detectMimeTypeFromBytes } from '@/utils/base64'
import { CopyButton } from '@/components/common/CopyButton'

const { TextArea } = Input
const { Text } = Typography
const { Dragger } = Upload

export const Base64FileTab: React.FC = () => {
  const [fileDataUrl, setFileDataUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [fileMime, setFileMime] = useState<string>('')
  const [fileSize, setFileSize] = useState<number>(0)
  const [fileDecodeInput, setFileDecodeInput] = useState<string>('')
  const [fileError, setFileError] = useState<string | null>(null)

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
    return false
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
  )
}
