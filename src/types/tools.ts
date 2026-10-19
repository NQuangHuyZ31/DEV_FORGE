export type ToolId =
  | 'json-formatter'
  | 'base64'
  | 'uuid'
  | 'timestamp'
  | 'url-encoder'
  | 'api-client'
  | 'api-explorer'

export type ToolCategory = 'data' | 'api'

export interface ToolMetadata {
  id: ToolId
  code: string
  name: string
  shortName: string
  description: string
  category: ToolCategory
  icon: string
  badge?: string
  tags: string[]
}
