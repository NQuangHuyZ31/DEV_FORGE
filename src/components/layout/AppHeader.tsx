import React from 'react'
import { Layout, Input, Space, Tag, Button, Tooltip } from 'antd'
import {
  CodeOutlined,
  SearchOutlined,
  BulbOutlined,
  BulbFilled,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

const { Header } = Layout

interface AppHeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  isDarkMode: boolean
  onToggleTheme: () => void
  onOpenCorsGuide: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleTheme,
  onOpenCorsGuide,
}) => {
  return (
    <Header className="app-header">
      <div className="header-left">
        <Space align="center" size="small">
          <div className="logo-badge">
            <CodeOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div className="brand-text-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1 }}>
              <span className="brand-title">DevForge</span>
              <Tag color="blue" bordered={false} style={{ fontSize: 11, padding: '0 6px', fontWeight: 600, margin: 0, lineHeight: '18px' }}>
                v1.3
              </Tag>
            </div>
            <div className="brand-subtitle">Developer Utilities & API Cockpit</div>
          </div>
        </Space>
      </div>

      <div className="header-center">
        <Input
          prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
          placeholder="Search tools (e.g. json, base64, uuid, api, timestamp)..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="search-input"
        />
      </div>

      <div className="header-right">
        <Space size="middle">
          <Button
            type="text"
            icon={<SafetyCertificateOutlined />}
            onClick={onOpenCorsGuide}
            className="header-action-btn"
          >
            CORS Guide
          </Button>

          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <Button
              type="text"
              icon={isDarkMode ? <BulbFilled style={{ color: '#fadb14' }} /> : <BulbOutlined />}
              onClick={onToggleTheme}
              className="theme-toggle-btn"
            />
          </Tooltip>
        </Space>
      </div>
    </Header>
  )
}
