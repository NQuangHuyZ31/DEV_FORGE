import React, { useMemo } from 'react'
import { Card, Input, Typography, Tag, Space } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { RegexExecutionResult } from '@/utils/regex'

const { Text } = Typography
const { TextArea } = Input

interface RegexHighlightPreviewProps {
  testString: string
  onTestStringChange: (value: string) => void
  executionResult: RegexExecutionResult
}

export const RegexHighlightPreview: React.FC<RegexHighlightPreviewProps> = ({
  testString,
  onTestStringChange,
  executionResult,
}) => {
  // Visual Highlight Generator for Matched String
  const highlightedContent = useMemo(() => {
    if (!executionResult.isValid || executionResult.matches.length === 0 || !testString) {
      return <span>{testString}</span>
    }

    const segments: React.ReactNode[] = []
    let lastIndex = 0

    executionResult.matches.forEach((m, idx) => {
      // Unmatched leading slice
      if (m.index > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>{testString.slice(lastIndex, m.index)}</span>
        )
      }

      // Matched slice
      const matchEnd = m.index + m.match.length
      segments.push(
        <mark
          key={`match-${m.index}-${idx}`}
          style={{
            backgroundColor: idx % 2 === 0 ? 'rgba(22, 119, 255, 0.25)' : 'rgba(114, 46, 209, 0.25)',
            borderBottom: '2px solid #1677ff',
            borderRadius: 3,
            padding: '1px 3px',
            color: 'inherit',
          }}
          title={`Match #${idx + 1} at [${m.index}-${matchEnd}]`}
        >
          {m.match}
        </mark>
      )

      lastIndex = matchEnd
    })

    // Trailing unmatched slice
    if (lastIndex < testString.length) {
      segments.push(
        <span key={`text-${lastIndex}`}>{testString.slice(lastIndex)}</span>
      )
    }

    return segments
  }, [testString, executionResult])

  return (
    <Card
      title={
        <Space>
          <SearchOutlined />
          <Text strong>Chuỗi Kiểm Thử (Test String)</Text>
        </Space>
      }
      className="editor-card"
    >
      <TextArea
        value={testString}
        onChange={(e) => onTestStringChange(e.target.value)}
        placeholder="Nhập hoặc dán văn bản cần kiểm tra regex vào đây..."
        rows={9}
        className="monospace-editor"
      />

      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text strong style={{ fontSize: 13 }}>
            Khớp Trực Quan (Highlight Preview):
          </Text>
          <Tag color={executionResult.matchCount > 0 ? 'green' : 'default'}>
            {executionResult.matchCount} kết quả khớp
          </Tag>
        </div>

        <div
          style={{
            maxHeight: 180,
            overflowY: 'auto',
            padding: 12,
            background: 'var(--code-bg, rgba(0, 0, 0, 0.03))',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {highlightedContent}
        </div>
      </div>
    </Card>
  )
}
