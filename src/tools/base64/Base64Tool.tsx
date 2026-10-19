import React, { useState } from 'react'
import { Typography, Alert, Tabs, Space } from 'antd'
import {
  InfoCircleOutlined,
  FileImageOutlined,
  FileTextOutlined,
  NumberOutlined,
} from '@ant-design/icons'
import { Base64TextTab } from './components/Base64TextTab'
import { Base64FileTab } from './components/Base64FileTab'
import { Base64HexTab } from './components/Base64HexTab'

const { Title, Text } = Typography

type ToolTab = 'text' | 'file' | 'hex'

export const Base64Tool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('text')

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
            children: <Base64TextTab />,
          },
          {
            key: 'file',
            label: (
              <Space>
                <FileImageOutlined />
                <span>File & Image (Data URL)</span>
              </Space>
            ),
            children: <Base64FileTab />,
          },
          {
            key: 'hex',
            label: (
              <Space>
                <NumberOutlined />
                <span>Hex Bytes ➔ Base64</span>
              </Space>
            ),
            children: <Base64HexTab />,
          },
        ]}
      />
    </div>
  )
}
