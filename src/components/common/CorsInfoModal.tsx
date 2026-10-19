import React from 'react'
import { Modal, Typography, Alert, Divider, Space, Tag } from 'antd'
import { InfoCircleOutlined, SafetyCertificateOutlined, ApiOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

interface CorsInfoModalProps {
  open: boolean
  onClose: () => void
}

export const CorsInfoModal: React.FC<CorsInfoModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1677ff', fontSize: 20 }} />
          <span>Understanding Browser CORS & Network Limits</span>
        </Space>
      }
      width={680}
    >
      <Paragraph style={{ marginTop: 12 }}>
        <strong>DevForge</strong> is a pure client-side web application running entirely inside your
        browser. Because requests originate directly from the browser, standard web security
        mechanisms apply.
      </Paragraph>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="What is CORS (Cross-Origin Resource Sharing)?"
        description="CORS is a W3C browser security policy that restricts web pages from making HTTP requests to a different domain unless that server explicitly permits it using HTTP response headers (e.g., Access-Control-Allow-Origin)."
        style={{ marginBottom: 16 }}
      />

      <Title level={5}>Why do some API requests fail with "Failed to fetch"?</Title>
      <Paragraph>
        When you test an external API from DevForge, if that server does not include CORS response
        headers for the origin:
      </Paragraph>
      <ul>
        <li>The browser blocks JavaScript from inspecting the HTTP status code and response body.</li>
        <li>The browser raises a generic network exception for security purposes.</li>
        <li>This is browser behavior by design, not a bug in DevForge.</li>
      </ul>

      <Divider />

      <Title level={5}>
        <ApiOutlined /> Recommended Testing Practices
      </Title>
      <Paragraph>To test REST APIs smoothly in DevForge:</Paragraph>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Tag color="cyan">1. Use Predefined CORS APIs</Tag>
          <Text>
            Explore <strong>JSONPlaceholder</strong> or <strong>DummyJSON</strong> via the API
            Explorer tab—they allow CORS from any origin.
          </Text>
        </div>
        <div>
          <Tag color="purple">2. Configure Server Headers</Tag>
          <Text>
            If testing your own backend (e.g., FastAPI, Express, Spring Boot, Laravel), enable CORS
            middleware or return <Text code>Access-Control-Allow-Origin: *</Text>.
          </Text>
        </div>
        <div>
          <Tag color="orange">3. Development Proxies</Tag>
          <Text>
            In team enterprise setups, route requests through a designated API gateway or reverse
            proxy that manages headers and credentials.
          </Text>
        </div>
      </Space>
    </Modal>
  )
}
