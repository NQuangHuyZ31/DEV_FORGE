import React from 'react'
import { Modal, Space, Table, Typography } from 'antd'
import { BookOutlined } from '@ant-design/icons'

const { Text } = Typography

interface RegexCheatSheetModalProps {
  open: boolean
  onCancel: () => void
}

const CHEAT_SHEET_DATA = [
  { token: '.', description: 'Any character except newline', example: 'a.c matches abc, a1c' },
  { token: '\\d', description: 'Any digit (0-9)', example: '\\d{4} matches 2026' },
  { token: '\\D', description: 'Any non-digit character', example: '\\D+ matches text' },
  { token: '\\w', description: 'Word character [a-zA-Z0-9_]', example: '\\w+ matches user_1' },
  { token: '\\W', description: 'Non-word character', example: '\\W matches ! or @' },
  { token: '\\s', description: 'Whitespace character (space, tab, newline)', example: '\\s+ matches spaces' },
  { token: '^', description: 'Start of string (or line in multiline mode)', example: '^Hello' },
  { token: '$', description: 'End of string (or line in multiline mode)', example: 'World$' },
  { token: '*', description: '0 or more occurrences', example: 'ab* matches a, ab, abb' },
  { token: '+', description: '1 or more occurrences', example: 'ab+ matches ab, abb' },
  { token: '?', description: '0 or 1 occurrence (optional)', example: 'colou?r matches color, colour' },
  { token: '{n,m}', description: 'Between n and m occurrences', example: '\\d{2,4} matches 99, 9999' },
  { token: '[abc]', description: 'Character set (matches a, b, or c)', example: '[aeiou] matches vowels' },
  { token: '[^abc]', description: 'Negated set (any character except a, b, c)', example: '[^0-9] matches non-numbers' },
  { token: '(...)', description: 'Capturing group', example: '(\\w+)@(\\w+)' },
  { token: '(?:...)', description: 'Non-capturing group', example: '(?:https?|ftp)' },
  { token: '(?<name>...)', description: 'Named capturing group', example: '(?<id>\\d+)' },
  { token: 'a|b', description: 'Alternation (matches a OR b)', example: 'cat|dog' },
]

export const RegexCheatSheetModal: React.FC<RegexCheatSheetModalProps> = ({
  open,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <Space>
          <BookOutlined style={{ color: '#1677ff' }} />
          <span>Regex Cheat Sheet — Bảng Tra Cứu Cú Pháp</span>
        </Space>
      }
      width={700}
    >
      <Table
        dataSource={CHEAT_SHEET_DATA}
        rowKey="token"
        size="small"
        pagination={false}
        columns={[
          {
            title: 'Ký hiệu',
            dataIndex: 'token',
            width: 120,
            render: (token: string) => <Text code strong>{token}</Text>,
          },
          {
            title: 'Ý nghĩa / Mô tả',
            dataIndex: 'description',
          },
          {
            title: 'Ví dụ',
            dataIndex: 'example',
            render: (ex: string) => <Text type="secondary" style={{ fontSize: 12 }}>{ex}</Text>,
          },
        ]}
      />
    </Modal>
  )
}
