import React from 'react'
import { Layout, Menu, Tag } from 'antd'
import {
  CodeOutlined,
  SwapOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  SendOutlined,
  ApartmentOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ToolId } from '@/types/tools'
import { toolsRegistry } from '@/tools/registry'

const { Sider } = Layout

const ICON_MAP: Record<string, React.ReactNode> = {
  CodeOutlined: <CodeOutlined />,
  SwapOutlined: <SwapOutlined />,
  KeyOutlined: <KeyOutlined />,
  ClockCircleOutlined: <ClockCircleOutlined />,
  LinkOutlined: <LinkOutlined />,
  SendOutlined: <SendOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  SearchOutlined: <SearchOutlined />,
}

interface AppSidebarProps {
  selectedToolId: ToolId
  onSelectTool: (id: ToolId) => void
  searchQuery: string
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  selectedToolId,
  onSelectTool,
  searchQuery,
  collapsed,
  onCollapse,
}) => {
  const filteredTools = toolsRegistry.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })

  const dataTools = filteredTools.filter((t) => t.category === 'data')
  const apiTools = filteredTools.filter((t) => t.category === 'api')

  const menuItems = [
    ...(dataTools.length > 0
      ? [
          {
            type: 'group' as const,
            label: 'DATA UTILITIES',
            children: dataTools.map((tool) => ({
              key: tool.id,
              icon: ICON_MAP[tool.icon],
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{tool.shortName}</span>
                  {tool.badge && !collapsed && (
                    <Tag
                      color="blue"
                      style={{
                        margin: 0,
                        fontSize: 10,
                        padding: '0 4px',
                        lineHeight: '16px',
                        borderRadius: 3,
                      }}
                    >
                      {tool.code}
                    </Tag>
                  )}
                </div>
              ),
            })),
          },
        ]
      : []),
    ...(apiTools.length > 0
      ? [
          {
            type: 'group' as const,
            label: 'REST & APIS',
            children: apiTools.map((tool) => ({
              key: tool.id,
              icon: ICON_MAP[tool.icon],
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{tool.shortName}</span>
                  {tool.badge && !collapsed && (
                    <Tag
                      color="purple"
                      style={{
                        margin: 0,
                        fontSize: 10,
                        padding: '0 4px',
                        lineHeight: '16px',
                        borderRadius: 3,
                      }}
                    >
                      {tool.code}
                    </Tag>
                  )}
                </div>
              ),
            })),
          },
        ]
      : []),
  ]

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      width={240}
      className="app-sidebar"
      theme="light"
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedToolId]}
        onClick={({ key }) => onSelectTool(key as ToolId)}
        items={menuItems}
        style={{ borderRight: 0, height: '100%', overflowY: 'auto' }}
      />
    </Sider>
  )
}
