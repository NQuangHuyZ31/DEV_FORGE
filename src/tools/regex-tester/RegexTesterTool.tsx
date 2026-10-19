import React, { useState, useMemo } from 'react'
import { Card, Button, Space, Typography, Tag, Row, Col, Tabs, Select } from 'antd'
import {
  ClearOutlined,
  BookOutlined,
  BuildOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  executeRegex,
  REGEX_PRESETS,
  type RegexExecutionResult,
} from '@/utils/regex'
import { RegexPatternBar } from './components/RegexPatternBar'
import { RegexHighlightPreview } from './components/RegexHighlightPreview'
import { RegexMatchesList } from './components/RegexMatchesList'
import { RegexReplaceTab } from './components/RegexReplaceTab'
import { RegexBuilderModal } from './components/RegexBuilderModal'
import { RegexCheatSheetModal } from './components/RegexCheatSheetModal'

const { Title, Text } = Typography

export const RegexTesterTool: React.FC = () => {
  // Regex pattern and flags
  const [pattern, setPattern] = useState<string>('\\b([A-Z][a-z]+)\\s+(\\d{4})\\b')
  const [flagG, setFlagG] = useState<boolean>(true)
  const [flagI, setFlagI] = useState<boolean>(false)
  const [flagM, setFlagM] = useState<boolean>(false)
  const [flagS, setFlagS] = useState<boolean>(false)
  const [flagU, setFlagU] = useState<boolean>(true)

  // Test String
  const [testString, setTestString] = useState<string>(
    'DevForge release happened in October 2026. Antigravity was established in January 2024.'
  )

  // Substitution state
  const [replacePattern, setReplacePattern] = useState<string>('Release: $1 (Year: $2)')

  // Modals
  const [cheatSheetOpen, setCheatSheetOpen] = useState<boolean>(false)
  const [builderModalOpen, setBuilderModalOpen] = useState<boolean>(false)

  // Build flags string
  const activeFlags = useMemo(() => {
    let f = ''
    if (flagG) f += 'g'
    if (flagI) f += 'i'
    if (flagM) f += 'm'
    if (flagS) f += 's'
    if (flagU) f += 'u'
    return f
  }, [flagG, flagI, flagM, flagS, flagU])

  // Execute regex
  const executionResult: RegexExecutionResult = useMemo(() => {
    return executeRegex(pattern, activeFlags, testString, replacePattern)
  }, [pattern, activeFlags, testString, replacePattern])

  // Handle Preset selection
  const handleSelectPreset = (presetId: string) => {
    const preset = REGEX_PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setPattern(preset.pattern)
      setFlagG(preset.flags.includes('g'))
      setFlagI(preset.flags.includes('i'))
      setFlagM(preset.flags.includes('m'))
      setFlagS(preset.flags.includes('s'))
      setFlagU(preset.flags.includes('u'))
      setTestString(preset.sampleText)
    }
  }

  return (
    <div className="tool-container">
      {/* Header Bar */}
      <div className="tool-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Regex Tester & Builder
          </Title>
          <Text type="secondary">
            Kiểm tra biểu thức chính quy (Regular Expression) theo thời gian thực, bóc tách capture groups, thay thế chuỗi và thư viện mẫu.
          </Text>
        </div>
        <Space wrap>
          <Button icon={<BookOutlined />} onClick={() => setCheatSheetOpen(true)}>
            Cheat Sheet Cú pháp
          </Button>
          <Button icon={<BuildOutlined />} type="dashed" onClick={() => setBuilderModalOpen(true)}>
            Trình tạo Regex Nhanh
          </Button>
          <Button
            icon={<ClearOutlined />}
            danger
            onClick={() => {
              setPattern('')
              setTestString('')
            }}
          >
            Clear
          </Button>
        </Space>
      </div>

      {/* Preset Library Selection */}
      <Card size="small" style={{ margin: '14px 0' }} className="config-card">
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Space align="center">
              <ThunderboltOutlined style={{ color: '#fa8c16' }} />
              <Text strong>Thư viện mẫu Regex:</Text>
            </Space>
          </Col>
          <Col xs={24} md={16}>
            <Select
              placeholder="Chọn mẫu có sẵn (Email, SĐT VN, URL, IPv4, Date, Hex...)"
              style={{ width: '100%' }}
              onChange={handleSelectPreset}
              options={REGEX_PRESETS.map((p) => ({
                value: p.id,
                label: (
                  <Space>
                    <Tag color="blue">{p.category.toUpperCase()}</Tag>
                    <span>{p.name}</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      — {p.description}
                    </Text>
                  </Space>
                ),
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Pattern Bar */}
      <RegexPatternBar
        pattern={pattern}
        onPatternChange={setPattern}
        flagG={flagG}
        onFlagGChange={setFlagG}
        flagI={flagI}
        onFlagIChange={setFlagI}
        flagM={flagM}
        onFlagMChange={setFlagM}
        flagS={flagS}
        onFlagSChange={setFlagS}
        flagU={flagU}
        onFlagUChange={setFlagU}
        activeFlags={activeFlags}
        isValid={executionResult.isValid}
        error={executionResult.error}
      />

      {/* Main Work Area: Test String & Matches / Substitution */}
      <Row gutter={[16, 16]}>
        {/* Left Column: Test String Input & Highlight View */}
        <Col xs={24} lg={12}>
          <RegexHighlightPreview
            testString={testString}
            onTestStringChange={setTestString}
            executionResult={executionResult}
          />
        </Col>

        {/* Right Column: Matches Details & Replace Playground */}
        <Col xs={24} lg={12}>
          <Card className="editor-card">
            <Tabs
              defaultActiveKey="matches"
              items={[
                {
                  key: 'matches',
                  label: `Kết Quả Khớp (${executionResult.matchCount})`,
                  children: (
                    <RegexMatchesList
                      matches={executionResult.matches}
                      matchCount={executionResult.matchCount}
                      hasPattern={!!pattern}
                    />
                  ),
                },
                {
                  key: 'replace',
                  label: 'Thay Thế (Substitution)',
                  children: (
                    <RegexReplaceTab
                      replacePattern={replacePattern}
                      onReplacePatternChange={setReplacePattern}
                      replacedOutput={executionResult.replacedOutput || ''}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal: Regex Quick Builder */}
      <RegexBuilderModal
        open={builderModalOpen}
        onCancel={() => setBuilderModalOpen(false)}
        onApply={(generated) => {
          setPattern(generated)
          setBuilderModalOpen(false)
        }}
      />

      {/* Modal: Cheat Sheet */}
      <RegexCheatSheetModal
        open={cheatSheetOpen}
        onCancel={() => setCheatSheetOpen(false)}
      />
    </div>
  )
}
