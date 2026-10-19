import React from 'react'
import { Card, Row, Col, Input, Typography, Tooltip, Checkbox, Alert, Space } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

interface RegexPatternBarProps {
  pattern: string
  onPatternChange: (p: string) => void
  flagG: boolean
  onFlagGChange: (v: boolean) => void
  flagI: boolean
  onFlagIChange: (v: boolean) => void
  flagM: boolean
  onFlagMChange: (v: boolean) => void
  flagS: boolean
  onFlagSChange: (v: boolean) => void
  flagU: boolean
  onFlagUChange: (v: boolean) => void
  activeFlags: string
  isValid: boolean
  error?: string
}

export const RegexPatternBar: React.FC<RegexPatternBarProps> = ({
  pattern,
  onPatternChange,
  flagG,
  onFlagGChange,
  flagI,
  onFlagIChange,
  flagM,
  onFlagMChange,
  flagS,
  onFlagSChange,
  flagU,
  onFlagUChange,
  activeFlags,
  isValid,
  error,
}) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 12]} align="middle">
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Text strong style={{ fontSize: 20, color: '#8c8c8c' }}>
              /
            </Text>
            <Input
              value={pattern}
              onChange={(e) => onPatternChange(e.target.value)}
              placeholder="Nhập biểu thức chính quy (e.g. \b[A-Z]+\b)..."
              style={{ fontFamily: 'monospace', fontSize: 15 }}
              status={!isValid ? 'error' : ''}
            />
            <Text strong style={{ fontSize: 20, color: '#8c8c8c' }}>
              /{activeFlags}
            </Text>
          </div>
        </Col>

        {/* Flags Toggles */}
        <Col xs={24} lg={8}>
          <Space wrap size="small">
            <Tooltip title="Global: Tìm tất cả kết quả khớp thay vì dừng ở kết quả đầu tiên">
              <Checkbox checked={flagG} onChange={(e) => onFlagGChange(e.target.checked)}>
                <Text code>g</Text> (Global)
              </Checkbox>
            </Tooltip>
            <Tooltip title="Ignore Case: Không phân biệt chữ hoa/thường">
              <Checkbox checked={flagI} onChange={(e) => onFlagIChange(e.target.checked)}>
                <Text code>i</Text> (Insensitive)
              </Checkbox>
            </Tooltip>
            <Tooltip title="Multiline: ^ và $ khớp đầu/cuối của từng dòng">
              <Checkbox checked={flagM} onChange={(e) => onFlagMChange(e.target.checked)}>
                <Text code>m</Text> (Multiline)
              </Checkbox>
            </Tooltip>
            <Tooltip title="DotAll: Ký tự '.' khớp cả ký tự xuống dòng (\n)">
              <Checkbox checked={flagS} onChange={(e) => onFlagSChange(e.target.checked)}>
                <Text code>s</Text> (DotAll)
              </Checkbox>
            </Tooltip>
            <Tooltip title="Unicode: Hỗ trợ đầy đủ ký tự Unicode (tiếng Việt, Emoji)">
              <Checkbox checked={flagU} onChange={(e) => onFlagUChange(e.target.checked)}>
                <Text code>u</Text> (Unicode)
              </Checkbox>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {!isValid && (
        <Alert
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
          message="Lỗi Cú Pháp Regex"
          description={error}
          style={{ marginTop: 12 }}
        />
      )}
    </Card>
  )
}
