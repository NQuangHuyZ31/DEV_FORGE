import React from 'react'
import { Tag } from 'antd'

interface StatusBadgeProps {
  status: number
  statusText?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, statusText }) => {
  let color = 'default'
  if (status >= 200 && status < 300) {
    color = 'success'
  } else if (status >= 300 && status < 400) {
    color = 'processing'
  } else if (status >= 400 && status < 500) {
    color = 'warning'
  } else if (status >= 500) {
    color = 'error'
  }

  return (
    <Tag color={color} style={{ fontWeight: 600, fontSize: 13, padding: '2px 8px' }}>
      {status} {statusText || ''}
    </Tag>
  )
}
