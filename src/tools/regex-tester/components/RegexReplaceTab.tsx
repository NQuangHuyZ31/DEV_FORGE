import React from 'react'
import { Input, Typography } from 'antd'
import { CopyButton } from '@/components/common/CopyButton'

const { Text } = Typography
const { TextArea } = Input

interface RegexReplaceTabProps {
  replacePattern: string
  onReplacePatternChange: (pattern: string) => void
  replacedOutput: string
}

export const RegexReplaceTab: React.FC<RegexReplaceTabProps> = ({
  replacePattern,
  onReplacePatternChange,
  replacedOutput,
}) => {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Text strong>Mẫu Thay Thế (Replacement Pattern):</Text>
        <div style={{ marginTop: 6 }}>
          <Input
            value={replacePattern}
            onChange={(e) => onReplacePatternChange(e.target.value)}
            placeholder="Nhập chuỗi thay thế, ví dụ: $1-$2 hoặc [REPLACED]"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
          Mẹo: Sử dụng <Text code>$1</Text>, <Text code>$2</Text> cho các nhóm bắt, hoặc <Text code>$&</Text> cho toàn bộ chuỗi khớp.
        </Text>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text strong>Kết Quả Sau Thay Thế:</Text>
          <CopyButton text={replacedOutput || ''} size="small" />
        </div>
        <TextArea
          value={replacedOutput || ''}
          readOnly
          rows={11}
          className="monospace-editor"
        />
      </div>
    </div>
  )
}
