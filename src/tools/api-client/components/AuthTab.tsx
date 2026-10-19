import React from 'react'
import { Alert, Space, Typography, Radio, Row, Col, Input } from 'antd'
import { SafetyCertificateOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'
import type { AuthType, ApiKeyLocation } from '@/types/http'

const { Text } = Typography

interface AuthTabProps {
  authType: AuthType
  onAuthTypeChange: (type: AuthType) => void
  bearerToken: string
  onBearerTokenChange: (token: string) => void
  apiKeyName: string
  onApiKeyNameChange: (name: string) => void
  apiKeyValue: string
  onApiKeyValueChange: (value: string) => void
  apiKeyLocation: ApiKeyLocation
  onApiKeyLocationChange: (loc: ApiKeyLocation) => void
}

export const AuthTab: React.FC<AuthTabProps> = ({
  authType,
  onAuthTypeChange,
  bearerToken,
  onBearerTokenChange,
  apiKeyName,
  onApiKeyNameChange,
  apiKeyValue,
  onApiKeyValueChange,
  apiKeyLocation,
  onApiKeyLocationChange,
}) => {
  return (
    <div style={{ maxWidth: 650 }}>
      <Alert
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        message="Privacy & Credential Isolation"
        description="Authentication tokens and keys are kept strictly in-memory during this tab session. DevForge NEVER saves credentials to localStorage, NEVER persists secrets to cookies, and NEVER sends them to analytics."
        style={{ marginBottom: 16 }}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Text strong>Authentication Type:</Text>
          <div style={{ marginTop: 8 }}>
            <Radio.Group
              value={authType}
              onChange={(e) => onAuthTypeChange(e.target.value as AuthType)}
              buttonStyle="solid"
            >
              <Radio.Button value="none">No Auth (Public)</Radio.Button>
              <Radio.Button value="bearer">Bearer Token</Radio.Button>
              <Radio.Button value="apikey">API Key</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {authType === 'bearer' && (
          <div>
            <Text strong>Bearer Token:</Text>
            <Input.Password
              value={bearerToken}
              onChange={(e) => onBearerTokenChange(e.target.value)}
              placeholder="Enter Bearer token (without 'Bearer ' prefix)"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              style={{ marginTop: 6 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Will be sent as Header: <Text code>Authorization: Bearer &lt;token&gt;</Text>
            </Text>
          </div>
        )}

        {authType === 'apikey' && (
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Row gutter={12}>
              <Col span={10}>
                <Text strong>Key Name:</Text>
                <Input
                  value={apiKeyName}
                  onChange={(e) => onApiKeyNameChange(e.target.value)}
                  placeholder="e.g. X-API-Key, api_key"
                  style={{ marginTop: 4 }}
                />
              </Col>
              <Col span={14}>
                <Text strong>Key Value:</Text>
                <Input.Password
                  value={apiKeyValue}
                  onChange={(e) => onApiKeyValueChange(e.target.value)}
                  placeholder="Secret API key value"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  style={{ marginTop: 4 }}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 8 }}>
              <Text strong>Add to: </Text>
              <Radio.Group
                value={apiKeyLocation}
                onChange={(e) => onApiKeyLocationChange(e.target.value as ApiKeyLocation)}
              >
                <Radio value="header">Request Headers</Radio>
                <Radio value="query">Query Params</Radio>
              </Radio.Group>
            </div>
          </Space>
        )}
      </Space>
    </div>
  )
}
