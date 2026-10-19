import React, { useState } from 'react'
import { Layout, ConfigProvider, theme as antdTheme, Typography } from 'antd'
import type { ToolId } from '@/types/tools'
import type { HttpRequest } from '@/types/http'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { JsonFormatterTool } from '@/tools/json-formatter/JsonFormatterTool'
import { Base64Tool } from '@/tools/base64/Base64Tool'
import { UuidTool } from '@/tools/uuid/UuidTool'
import { TimestampTool } from '@/tools/timestamp/TimestampTool'
import { UrlEncoderTool } from '@/tools/url-encoder/UrlEncoderTool'
import { RegexTesterTool } from '@/tools/regex-tester/RegexTesterTool'
import { ApiClientTool } from '@/tools/api-client/ApiClientTool'
import { ApiExplorerTool } from '@/tools/api-explorer/ApiExplorerTool'
import { CorsInfoModal } from '@/components/common/CorsInfoModal'

const { Content, Footer } = Layout
const { Text } = Typography

export const AppLayout: React.FC = () => {
  const [selectedToolId, setSelectedToolId] = useState<ToolId>('json-formatter')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('devforge_theme')
      if (saved !== null) {
        return saved === 'dark'
      }
    } catch {
      // ignore
    }
    return true // Default theme is Dark
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const [corsModalOpen, setCorsModalOpen] = useState<boolean>(false)

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem('devforge_theme', next ? 'dark' : 'light')
      } catch {
        // ignore
      }
      return next
    })
  }

  // Injected request for API client when navigated from Explorer
  const [pendingApiRequest, setPendingApiRequest] = useState<HttpRequest | undefined>(undefined)

  const handleSelectTool = (id: ToolId) => {
    setSelectedToolId(id)
  }

  const handleLoadIntoClient = (req: HttpRequest) => {
    setPendingApiRequest(req)
    setSelectedToolId('api-client')
  }

  const renderTool = () => {
    switch (selectedToolId) {
      case 'json-formatter':
        return <JsonFormatterTool />
      case 'base64':
        return <Base64Tool />
      case 'uuid':
        return <UuidTool />
      case 'timestamp':
        return <TimestampTool />
      case 'url-encoder':
        return <UrlEncoderTool />
      case 'regex-tester':
        return <RegexTesterTool />
      case 'api-client':
        return (
          <ApiClientTool
            initialRequest={pendingApiRequest}
            onSwitchToExplorer={() => setSelectedToolId('api-explorer')}
          />
        )
      case 'api-explorer':
        return <ApiExplorerTool onLoadIntoClient={handleLoadIntoClient} />
      default:
        return <JsonFormatterTool />
    }
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontFamilyCode: "'JetBrains Mono', Consolas, Monaco, monospace",
        },
      }}
    >
      <div className={`app-root ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Layout style={{ minHeight: '100vh' }}>
          <AppHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            onOpenCorsGuide={() => setCorsModalOpen(true)}
          />

          <Layout>
            <AppSidebar
              selectedToolId={selectedToolId}
              onSelectTool={handleSelectTool}
              searchQuery={searchQuery}
              collapsed={sidebarCollapsed}
              onCollapse={setSidebarCollapsed}
            />

            <Layout style={{ padding: '0 24px 24px' }}>
              <Content style={{ padding: '24px 0', minHeight: 480 }}>
                {renderTool()}
              </Content>

              <Footer style={{ textAlign: 'center', padding: '16px 0', fontSize: 13 }}>
                <Text type="secondary">
                  DevForge v1.3 • Privacy First (In-Browser Execution Only) • Built with React, TypeScript & Ant Design
                </Text>
              </Footer>
            </Layout>
          </Layout>
        </Layout>

        <CorsInfoModal open={corsModalOpen} onClose={() => setCorsModalOpen(false)} />
      </div>
    </ConfigProvider>
  )
}
