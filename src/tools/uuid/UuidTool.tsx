import React, { useState } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Slider,
  InputNumber,
  Switch,
  List,
  Row,
  Col,
  Tag,
} from 'antd'
import {
  ReloadOutlined,
  KeyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { generateUuids } from '@/utils/uuid'
import { CopyButton } from '@/components/common/CopyButton'

const { Text, Title } = Typography

export const UuidTool: React.FC = () => {
  const [count, setCount] = useState<number>(5)
  const [uppercase, setUppercase] = useState<boolean>(false)
  const [hyphens, setHyphens] = useState<boolean>(true)
  const [uuids, setUuids] = useState<string[]>(() =>
    generateUuids(5, { uppercase: false, hyphens: true })
  )

  const handleGenerate = (customCount?: number, isUpper?: boolean, withHyphens?: boolean) => {
    const c = customCount ?? count
    const u = isUpper ?? uppercase
    const h = withHyphens ?? hyphens
    const generated = generateUuids(c, { uppercase: u, hyphens: h })
    setUuids(generated)
  }

  const allUuidsText = uuids.join('\n')

  return (
    <div className="tool-container">
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            UUID v4 Generator
          </Title>
          <Text type="secondary">
            Generate cryptographically secure random Version 4 UUIDs using browser Web Crypto APIs.
          </Text>
        </div>
        <Space wrap>
          <CopyButton
            text={allUuidsText}
            label="Copy All UUIDs"
            type="primary"
            size="middle"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => handleGenerate()}
          >
            Regenerate
          </Button>
        </Space>
      </div>

      <Card style={{ margin: '16px 0' }} className="config-card">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Text strong>Quantity (1 - 100):</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Slider
                min={1}
                max={100}
                value={count}
                onChange={(val) => {
                  setCount(val)
                  handleGenerate(val)
                }}
                style={{ flex: 1 }}
              />
              <InputNumber
                min={1}
                max={100}
                value={count}
                onChange={(val) => {
                  if (val) {
                    setCount(val)
                    handleGenerate(val)
                  }
                }}
              />
            </div>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Space direction="vertical" size="small">
              <Text strong>Uppercase:</Text>
              <Switch
                checked={uppercase}
                onChange={(checked) => {
                  setUppercase(checked)
                  handleGenerate(count, checked, hyphens)
                }}
              />
            </Space>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Space direction="vertical" size="small">
              <Text strong>Include Hyphens:</Text>
              <Switch
                checked={hyphens}
                onChange={(checked) => {
                  setHyphens(checked)
                  handleGenerate(count, uppercase, checked)
                }}
              />
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Tag color="cyan" icon={<CheckCircleOutlined />}>
              RFC 4122 Compliant (crypto.randomUUID)
            </Tag>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <KeyOutlined />
            <span>Generated UUIDs</span>
            <Tag color="blue">{uuids.length} generated</Tag>
          </Space>
        }
        extra={<CopyButton text={allUuidsText} label="Copy All" size="small" />}
      >
        <List
          bordered
          dataSource={uuids}
          renderItem={(uuid, index) => (
            <List.Item
              actions={[
                <CopyButton key="copy" text={uuid} size="small" type="text" />,
              ]}
              style={{ padding: '10px 16px' }}
            >
              <Space>
                <Tag color="default" style={{ width: 36, textAlign: 'center' }}>
                  #{index + 1}
                </Tag>
                <Text code style={{ fontSize: 14 }}>
                  {uuid}
                </Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
