import React from 'react'
import { List, Space, Tag, Typography } from 'antd'
import type { RegexMatchItem } from '@/utils/regex'
import { CopyButton } from '@/components/common/CopyButton'

const { Text } = Typography

interface RegexMatchesListProps {
  matches: RegexMatchItem[]
  matchCount: number
  hasPattern: boolean
}

export const RegexMatchesList: React.FC<RegexMatchesListProps> = ({
  matches,
  matchCount,
  hasPattern,
}) => {
  if (matchCount === 0) {
    return (
      <div style={{ padding: '30px 0', textAlign: 'center' }}>
        <Text type="secondary">
          {hasPattern ? 'Không tìm thấy kết quả nào khớp với biểu thức.' : 'Hãy nhập pattern để kiểm tra.'}
        </Text>
      </div>
    )
  }

  return (
    <List
      size="small"
      bordered
      style={{ maxHeight: 380, overflowY: 'auto' }}
      dataSource={matches}
      renderItem={(item, index) => (
        <List.Item
          actions={[
            <CopyButton key="copy" text={item.match} size="small" type="text" />,
          ]}
        >
          <div style={{ width: '100%' }}>
            <Space style={{ marginBottom: 4 }}>
              <Tag color="blue">#{index + 1}</Tag>
              <Text code strong style={{ fontSize: 14 }}>
                {item.match}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                (vị trí {item.index} - {item.index + item.match.length})
              </Text>
            </Space>

            {/* Capture Groups */}
            {item.groups.length > 0 && (
              <div style={{ marginTop: 4, paddingLeft: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Capture Groups:
                </Text>
                {item.groups.map((g, gIdx) => (
                  <div key={gIdx} style={{ fontSize: 12 }}>
                    <Text code>${gIdx + 1}:</Text> {g || '<empty>'}
                  </div>
                ))}
              </div>
            )}

            {/* Named Groups */}
            {item.namedGroups && Object.keys(item.namedGroups).length > 0 && (
              <div style={{ marginTop: 4, paddingLeft: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Named Groups:
                </Text>
                {Object.entries(item.namedGroups).map(([k, v]) => (
                  <div key={k} style={{ fontSize: 12 }}>
                    <Text code>{k}:</Text> {v}
                  </div>
                ))}
              </div>
            )}
          </div>
        </List.Item>
      )}
    />
  )
}
