import React, { useState } from 'react'
import { Button, Tooltip, message } from 'antd'
import { CopyOutlined, CheckOutlined } from '@ant-design/icons'
import { copyToClipboard } from '@/utils/clipboard'

interface CopyButtonProps {
  text: string
  label?: string
  tooltip?: string
  size?: 'small' | 'middle' | 'large'
  type?: 'default' | 'primary' | 'text' | 'link'
  className?: string
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  tooltip = 'Copy to clipboard',
  size = 'middle',
  type = 'default',
  className,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!text) {
      message.warning('Nothing to copy')
      return
    }

    const res = await copyToClipboard(text)
    if (res.success) {
      setCopied(true)
      message.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } else {
      message.error(res.error || 'Failed to copy')
    }
  }

  return (
    <Tooltip title={copied ? 'Copied!' : tooltip}>
      <Button
        size={size}
        type={type}
        icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
        onClick={handleCopy}
        className={className}
      >
        {label}
      </Button>
    </Tooltip>
  )
}
