import React, { useState } from 'react'
import { Modal, Space, Typography, Select, Input } from 'antd'
import { BuildOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

interface RegexBuilderModalProps {
  open: boolean
  onCancel: () => void
  onApply: (generatedPattern: string) => void
}

export const RegexBuilderModal: React.FC<RegexBuilderModalProps> = ({
  open,
  onCancel,
  onApply,
}) => {
  const [builderType, setBuilderType] = useState<string>('digits')
  const [builderAnchor, setBuilderAnchor] = useState<string>('anywhere')
  const [builderQuantifier, setBuilderQuantifier] = useState<string>('plus')
  const [builderCustomValue, setBuilderCustomValue] = useState<string>('')

  const handleGenerate = () => {
    let core = ''
    if (builderType === 'digits') core = '\\d'
    else if (builderType === 'letters') core = '[a-zA-Z]'
    else if (builderType === 'alphanumeric') core = '[a-zA-Z0-9]'
    else if (builderType === 'custom' && builderCustomValue) {
      core = builderCustomValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    } else {
      core = '\\w'
    }

    // Apply quantifier
    if (builderQuantifier === 'plus') core += '+'
    else if (builderQuantifier === 'star') core += '*'
    else if (builderQuantifier === 'optional') core += '?'
    else if (builderQuantifier === 'range') core += '{1,10}'

    // Apply anchor
    let generated = core
    if (builderAnchor === 'start') generated = `^${core}`
    else if (builderAnchor === 'end') generated = `${core}$`
    else if (builderAnchor === 'exact') generated = `^${core}$`

    onApply(generated)
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleGenerate}
      okText="Tạo & Sử dụng Regex"
      cancelText="Đóng"
      title={
        <Space>
          <BuildOutlined style={{ color: '#1677ff' }} />
          <span>Trình Tạo Biểu Thức Chính Quy Nhanh</span>
        </Space>
      }
      width={560}
    >
      <Paragraph type="secondary">
        Tạo nhanh pattern regex cơ bản mà không cần phải nhớ toàn bộ ký hiệu thoát.
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>1. Loại Ký Tự Cần Khớp:</Text>
          <Select
            value={builderType}
            onChange={setBuilderType}
            style={{ width: '100%', marginTop: 6 }}
            options={[
              { value: 'digits', label: 'Chỉ chữ số (0-9) — \\d' },
              { value: 'letters', label: 'Chỉ chữ cái (a-z, A-Z) — [a-zA-Z]' },
              { value: 'alphanumeric', label: 'Chữ cái và số — [a-zA-Z0-9]' },
              { value: 'words', label: 'Từ ngữ / ký tự định danh — \\w' },
              { value: 'custom', label: 'Chuỗi ký tự cụ thể...' },
            ]}
          />
          {builderType === 'custom' && (
            <Input
              placeholder="Nhập ký tự cụ thể cần tìm..."
              value={builderCustomValue}
              onChange={(e) => setBuilderCustomValue(e.target.value)}
              style={{ marginTop: 6 }}
            />
          )}
        </div>

        <div>
          <Text strong>2. Số Lượng Ký Tự (Quantifier):</Text>
          <Select
            value={builderQuantifier}
            onChange={setBuilderQuantifier}
            style={{ width: '100%', marginTop: 6 }}
            options={[
              { value: 'plus', label: '1 hoặc nhiều lần — +' },
              { value: 'star', label: '0 hoặc nhiều lần — *' },
              { value: 'optional', label: 'Không có hoặc 1 lần — ?' },
              { value: 'range', label: 'Từ 1 đến 10 lần — {1,10}' },
            ]}
          />
        </div>

        <div>
          <Text strong>3. Vị Trí Trong Chuỗi (Anchor):</Text>
          <Select
            value={builderAnchor}
            onChange={setBuilderAnchor}
            style={{ width: '100%', marginTop: 6 }}
            options={[
              { value: 'anywhere', label: 'Bất kỳ đâu trong chuỗi' },
              { value: 'start', label: 'Bắt đầu ở đầu chuỗi (^) ' },
              { value: 'end', label: 'Kết thúc ở cuối chuỗi ($)' },
              { value: 'exact', label: 'Khớp toàn bộ chuỗi (^...$)' },
            ]}
          />
        </div>
      </Space>
    </Modal>
  )
}
