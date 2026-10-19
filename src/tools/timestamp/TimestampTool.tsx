import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Input,
  Radio,
  Row,
  Col,
  Descriptions,
  Tag,
  Alert,
  DatePicker,
} from 'antd'
import {
  ClockCircleOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import {
  convertTimestampToDate,
  convertDateToTimestamp,
  getCurrentTimezoneInfo,
  type TimestampUnit,
} from '@/utils/timestamp'
import { CopyButton } from '@/components/common/CopyButton'

const { Text, Title } = Typography

export const TimestampTool: React.FC = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number>(() => Math.floor(Date.now() / 1000))
  const [inputTimestamp, setInputTimestamp] = useState<string>(() =>
    String(Math.floor(Date.now() / 1000))
  )
  const [unit, setUnit] = useState<TimestampUnit>('auto')

  // Date to Timestamp state
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(() => dayjs())

  const tzInfo = getCurrentTimezoneInfo()

  // Real-time epoch clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const convResult = convertTimestampToDate(inputTimestamp, unit)
  const dateResult = selectedDate ? convertDateToTimestamp(selectedDate.toDate()) : null

  const handleUseCurrentTime = () => {
    setInputTimestamp(String(Math.floor(Date.now() / 1000)))
    setUnit('s')
  }

  return (
    <div className="tool-container">
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Unix Timestamp Converter
          </Title>
          <Text type="secondary">
            Convert epoch timestamps between Seconds, Milliseconds, ISO 8601 UTC, and Local timezone.
          </Text>
        </div>
        <Card
          size="small"
          style={{ background: 'var(--card-bg-subtle, rgba(22, 119, 255, 0.06))' }}
        >
          <Space>
            <ClockCircleOutlined style={{ color: '#1677ff' }} />
            <Text>Current Epoch:</Text>
            <Text strong code style={{ fontSize: 15 }}>
              {currentEpoch}
            </Text>
            <CopyButton text={String(currentEpoch)} size="small" />
          </Space>
        </Card>
      </div>

      <div style={{ margin: '16px 0' }}>
        <Space wrap>
          <Tag color="geekblue" icon={<GlobalOutlined />}>
            Local Timezone: {tzInfo.timezone} ({tzInfo.offsetString})
          </Tag>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* Timestamp -> Date Section */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Timestamp ➔ Human Date</span>
              </Space>
            }
            extra={
              <Button
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={handleUseCurrentTime}
              >
                Now
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Unix Timestamp:</Text>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <Input
                    value={inputTimestamp}
                    onChange={(e) => setInputTimestamp(e.target.value)}
                    placeholder="Enter timestamp (e.g. 1776543210 or 1776543210000)"
                    style={{ fontFamily: 'monospace' }}
                  />
                  <CopyButton text={inputTimestamp} />
                </div>
              </div>

              <div>
                <Space align="center">
                  <Text strong>Unit Mode:</Text>
                  <Radio.Group
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as TimestampUnit)}
                    size="small"
                  >
                    <Radio.Button value="auto">Auto Detect</Radio.Button>
                    <Radio.Button value="s">Seconds (s)</Radio.Button>
                    <Radio.Button value="ms">Milliseconds (ms)</Radio.Button>
                  </Radio.Group>
                </Space>
              </div>

              {convResult.isValid ? (
                <Descriptions bordered size="small" column={1} style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Detected Unit">
                    <Tag color={convResult.unitDetected === 's' ? 'blue' : 'purple'}>
                      {convResult.unitDetected === 's' ? 'Seconds (10 digits)' : 'Milliseconds (13 digits)'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Local Time">
                    <Space>
                      <Text strong>{convResult.localString}</Text>
                      <CopyButton text={convResult.localString || ''} size="small" type="text" />
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="UTC (ISO 8601)">
                    <Space>
                      <Text code>{convResult.utcIso}</Text>
                      <CopyButton text={convResult.utcIso || ''} size="small" type="text" />
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="UTC String">
                    <Text>{convResult.utcString}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Relative Time">
                    <Tag color="cyan">{convResult.relative}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Seconds">
                    <Text code>{convResult.seconds}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Milliseconds">
                    <Text code>{convResult.milliseconds}</Text>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Alert
                  type="warning"
                  showIcon
                  message="Invalid Timestamp"
                  description={convResult.error || 'Please enter a valid numeric Unix epoch.'}
                />
              )}
            </Space>
          </Card>
        </Col>

        {/* Date -> Timestamp Section */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Date & Time ➔ Timestamp</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Select Date & Time:</Text>
                <div style={{ marginTop: 6 }}>
                  <DatePicker
                    showTime
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {dateResult && (
                <Descriptions bordered size="small" column={1} style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Seconds (s)">
                    <Space>
                      <Text code strong>
                        {dateResult.seconds}
                      </Text>
                      <CopyButton text={String(dateResult.seconds)} size="small" type="text" />
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Milliseconds (ms)">
                    <Space>
                      <Text code strong>
                        {dateResult.milliseconds}
                      </Text>
                      <CopyButton text={String(dateResult.milliseconds)} size="small" type="text" />
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="ISO String">
                    <Text code style={{ fontSize: 12 }}>
                      {selectedDate?.toISOString()}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
