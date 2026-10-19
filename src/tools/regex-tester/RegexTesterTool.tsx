import React, { useState, useMemo } from 'react'
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Checkbox,
  Row,
  Col,
  Tabs,
  List,
  Select,
  Modal,
  Table,
  Tooltip,
} from 'antd'
import {
  CloseCircleOutlined,
  ClearOutlined,
  BookOutlined,
  BuildOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  executeRegex,
  REGEX_PRESETS,
  type RegexExecutionResult,
} from '@/utils/regex'
import { CopyButton } from '@/components/common/CopyButton'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

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

  // Builder Generator State
  const [builderType, setBuilderType] = useState<string>('digits')
  const [builderAnchor, setBuilderAnchor] = useState<string>('anywhere')
  const [builderQuantifier, setBuilderQuantifier] = useState<string>('plus')
  const [builderCustomValue, setBuilderCustomValue] = useState<string>('')

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

  // Handle Regex Builder insertion
  const handleGenerateRegex = () => {
    let core = ''
    if (builderType === 'digits') core = '\\d'
    else if (builderType === 'letters') core = '[a-zA-Z]'
    else if (builderType === 'alphanumeric') core = '[a-zA-Z0-9]'
    else if (builderType === 'custom' && builderCustomValue) {
      core = builderCustomValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    } else {
      core = '\\w'
    }

    // Apply quantifier
    if (builderQuantifier === 'plus') core += '+'
    else if (builderQuantifier === 'star') core += '*'
    else if (builderQuantifier === 'optional') core += '?'
    else if (builderQuantifier === 'range') core += '{1,10}'

    // Apply anchor
    let generated = core
    if (builderAnchor === 'start') generated = `^${core}`
    else if (builderAnchor === 'end') generated = `${core}$`
    else if (builderAnchor === 'exact') generated = `^${core}$`

    setPattern(generated)
    setBuilderModalOpen(false)
  }

  // Visual Highlight Generator for Matched String
  const highlightedContent = useMemo(() => {
    if (!executionResult.isValid || executionResult.matches.length === 0 || !testString) {
      return <span>{testString}</span>
    }

    const segments: React.ReactNode[] = []
    let lastIndex = 0

    executionResult.matches.forEach((m, idx) => {
      // Unmatched leading slice
      if (m.index > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>{testString.slice(lastIndex, m.index)}</span>
        )
      }

      // Matched slice
      const matchEnd = m.index + m.match.length
      segments.push(
        <mark
          key={`match-${m.index}-${idx}`}
          style={{
            backgroundColor: idx % 2 === 0 ? 'rgba(22, 119, 255, 0.25)' : 'rgba(114, 46, 209, 0.25)',
            borderBottom: '2px solid #1677ff',
            borderRadius: 3,
            padding: '1px 3px',
            color: 'inherit',
          }}
          title={`Match #${idx + 1} at [${m.index}-${matchEnd}]`}
        >
          {m.match}
        </mark>
      )

      lastIndex = matchEnd
    })

    // Trailing unmatched slice
    if (lastIndex < testString.length) {
      segments.push(
        <span key={`text-${lastIndex}`}>{testString.slice(lastIndex)}</span>
      )
    }

    return segments
  }, [testString, executionResult])

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
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} lg={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text strong style={{ fontSize: 20, color: '#8c8c8c' }}>
                /
              </Text>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Nhập biểu thức chính quy (e.g. \b[A-Z]+\b)..."
                style={{ fontFamily: 'monospace', fontSize: 15 }}
                status={!executionResult.isValid ? 'error' : ''}
              />
              <Text strong style={{ fontSize: 20, color: '#8c8c8c' }}>
                /{activeFlags}
              </Text>
            </div>
          </Col>

          {/* Flags Toggles */}
          <Col xs={24} lg={8}>
            <Space wrap size="small">
              <Tooltip title="Global: Tìm tất cả kết quả khớp thay vì dừng ở kết quả đầu tiên">
                <Checkbox checked={flagG} onChange={(e) => setFlagG(e.target.checked)}>
                  <Text code>g</Text> (Global)
                </Checkbox>
              </Tooltip>
              <Tooltip title="Ignore Case: Không phân biệt chữ hoa/thường">
                <Checkbox checked={flagI} onChange={(e) => setFlagI(e.target.checked)}>
                  <Text code>i</Text> (Insensitive)
                </Checkbox>
              </Tooltip>
              <Tooltip title="Multiline: ^ và $ khớp đầu/cuối của từng dòng">
                <Checkbox checked={flagM} onChange={(e) => setFlagM(e.target.checked)}>
                  <Text code>m</Text> (Multiline)
                </Checkbox>
              </Tooltip>
              <Tooltip title="DotAll: Ký tự '.' khớp cả ký tự xuống dòng (\n)">
                <Checkbox checked={flagS} onChange={(e) => setFlagS(e.target.checked)}>
                  <Text code>s</Text> (DotAll)
                </Checkbox>
              </Tooltip>
              <Tooltip title="Unicode: Hỗ trợ đầy đủ ký tự Unicode (tiếng Việt, Emoji)">
                <Checkbox checked={flagU} onChange={(e) => setFlagU(e.target.checked)}>
                  <Text code>u</Text> (Unicode)
                </Checkbox>
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {!executionResult.isValid && (
          <Alert
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
            message="Lỗi Cú Pháp Regex"
            description={executionResult.error}
            style={{ marginTop: 12 }}
          />
        )}
      </Card>

      {/* Main Work Area: Test String & Matches / Substitution */}
      <Row gutter={[16, 16]}>
        {/* Left Column: Test String Input & Highlight View */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SearchOutlined />
                <Text strong>Chuỗi Kiểm Thử (Test String)</Text>
              </Space>
            }
            className="editor-card"
          >
            <TextArea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Nhập hoặc dán văn bản cần kiểm tra regex vào đây..."
              rows={9}
              className="monospace-editor"
            />

            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text strong style={{ fontSize: 13 }}>
                  Khớp Trực Quan (Highlight Preview):
                </Text>
                <Tag color={executionResult.matchCount > 0 ? 'green' : 'default'}>
                  {executionResult.matchCount} kết quả khớp
                </Tag>
              </div>

              <div
                style={{
                  maxHeight: 180,
                  overflowY: 'auto',
                  padding: 12,
                  background: 'var(--code-bg, rgba(0, 0, 0, 0.03))',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {highlightedContent}
              </div>
            </div>
          </Card>
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
                    <div>
                      {executionResult.matchCount === 0 ? (
                        <div style={{ padding: '30px 0', textAlign: 'center' }}>
                          <Text type="secondary">
                            {pattern ? 'Không tìm thấy kết quả nào khớp với biểu thức.' : 'Hãy nhập pattern để kiểm tra.'}
                          </Text>
                        </div>
                      ) : (
                        <List
                          size="small"
                          bordered
                          style={{ maxHeight: 380, overflowY: 'auto' }}
                          dataSource={executionResult.matches}
                          renderItem={(item, index) => (
                            <List.Item
                              actions={[
                                <CopyButton key="copy" text={item.match} size="small" type="text" />,
                              ]}
                            >
                              <div style={{ width: '100%' }}>
                                <Space style={{ marginBottom: 4 }}>
                                  <Tag color="blue">#{index + 1}</Tag>
                                  <Text code strong style={{ fontSize: 14 }}>
                                    {item.match}
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    (vị trí {item.index} - {item.index + item.match.length})
                                  </Text>
                                </Space>

                                {/* Capture Groups */}
                                {item.groups.length > 0 && (
                                  <div style={{ marginTop: 4, paddingLeft: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Capture Groups:
                                    </Text>
                                    {item.groups.map((g, gIdx) => (
                                      <div key={gIdx} style={{ fontSize: 12 }}>
                                        <Text code>${gIdx + 1}:</Text> {g || '<empty>'}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Named Groups */}
                                {item.namedGroups && Object.keys(item.namedGroups).length > 0 && (
                                  <div style={{ marginTop: 4, paddingLeft: 12 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Named Groups:
                                    </Text>
                                    {Object.entries(item.namedGroups).map(([k, v]) => (
                                      <div key={k} style={{ fontSize: 12 }}>
                                        <Text code>{k}:</Text> {v}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </List.Item>
                          )}
                        />
                      )}
                    </div>
                  ),
                },
                {
                  key: 'replace',
                  label: 'Thay Thế (Substitution)',
                  children: (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>Mẫu Thay Thế (Replacement Pattern):</Text>
                        <div style={{ marginTop: 6 }}>
                          <Input
                            value={replacePattern}
                            onChange={(e) => setReplacePattern(e.target.value)}
                            placeholder="Nhập chuỗi thay thế, ví dụ: $1-$2 hoặc [REPLACED]"
                            style={{ fontFamily: 'monospace' }}
                          />
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                          Mẹo: Sử dụng <Text code>$1</Text>, <Text code>$2</Text> cho các nhóm bắt, hoặc <Text code>$&</Text> cho toàn bộ chuỗi khớp.
                        </Text>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Text strong>Kết Quả Sau Thay Thế:</Text>
                          <CopyButton text={executionResult.replacedOutput || ''} size="small" />
                        </div>
                        <TextArea
                          value={executionResult.replacedOutput || ''}
                          readOnly
                          rows={11}
                          className="monospace-editor"
                        />
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal: Regex Quick Builder */}
      <Modal
        open={builderModalOpen}
        onCancel={() => setBuilderModalOpen(false)}
        onOk={handleGenerateRegex}
        okText="Tạo & Sử dụng Regex"
        cancelText="Đóng"
        title={
          <Space>
            <BuildOutlined style={{ color: '#1677ff' }} />
            <span>Trình Tạo Biểu Thức Chính Quy Nhanh</span>
          </Space>
        }
        width={560}
      >
        <Paragraph type="secondary">
          Tạo nhanh pattern regex cơ bản mà không cần phải nhớ toàn bộ ký hiệu thoát.
        </Paragraph>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>1. Loại Ký Tự Cần Khớp:</Text>
            <Select
              value={builderType}
              onChange={setBuilderType}
              style={{ width: '100%', marginTop: 6 }}
              options={[
                { value: 'digits', label: 'Chỉ chữ số (0-9) — \\d' },
                { value: 'letters', label: 'Chỉ chữ cái (a-z, A-Z) — [a-zA-Z]' },
                { value: 'alphanumeric', label: 'Chữ cái và số — [a-zA-Z0-9]' },
                { value: 'words', label: 'Từ ngữ / ký tự định danh — \\w' },
                { value: 'custom', label: 'Chuỗi ký tự cụ thể...' },
              ]}
            />
            {builderType === 'custom' && (
              <Input
                placeholder="Nhập ký tự cụ thể cần tìm..."
                value={builderCustomValue}
                onChange={(e) => setBuilderCustomValue(e.target.value)}
                style={{ marginTop: 6 }}
              />
            )}
          </div>

          <div>
            <Text strong>2. Số Lượng Ký Tự (Quantifier):</Text>
            <Select
              value={builderQuantifier}
              onChange={setBuilderQuantifier}
              style={{ width: '100%', marginTop: 6 }}
              options={[
                { value: 'plus', label: '1 hoặc nhiều lần — +' },
                { value: 'star', label: '0 hoặc nhiều lần — *' },
                { value: 'optional', label: 'Không có hoặc 1 lần — ?' },
                { value: 'range', label: 'Từ 1 đến 10 lần — {1,10}' },
              ]}
            />
          </div>

          <div>
            <Text strong>3. Vị Trí Trong Chuỗi (Anchor):</Text>
            <Select
              value={builderAnchor}
              onChange={setBuilderAnchor}
              style={{ width: '100%', marginTop: 6 }}
              options={[
                { value: 'anywhere', label: 'Bất kỳ đâu trong chuỗi' },
                { value: 'start', label: 'Bắt đầu ở đầu chuỗi (^) ' },
                { value: 'end', label: 'Kết thúc ở cuối chuỗi ($)' },
                { value: 'exact', label: 'Khớp toàn bộ chuỗi (^...$)' },
              ]}
            />
          </div>
        </Space>
      </Modal>

      {/* Modal: Cheat Sheet */}
      <Modal
        open={cheatSheetOpen}
        onCancel={() => setCheatSheetOpen(false)}
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
    </div>
  )
}
