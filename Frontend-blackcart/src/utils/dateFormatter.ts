// src/utils/dateFormatter.ts
export const formatDate = (date: Date | string, format: string = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  const formatters = {
    short: new Intl.DateTimeFormat('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    long: new Intl.DateTimeFormat('en-PK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    time: new Intl.DateTimeFormat('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
    dateTime: new Intl.DateTimeFormat('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    relative: (date: Date) => {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSec = Math.round(diffMs / 1000)
      const diffMin = Math.round(diffSec / 60)
      const diffHour = Math.round(diffMin / 60)
      const diffDay = Math.round(diffHour / 24)
      
      if (diffSec < 60) return 'just now'
      if (diffMin < 60) return `${diffMin}m ago`
      if (diffHour < 24) return `${diffHour}h ago`
      if (diffDay < 7) return `${diffDay}d ago`
      return formatDate(date, 'short')
    },
  }
  
  if (format === 'relative') {
    return formatters.relative(dateObj)
  }
  
  return formatters[format as keyof typeof formatters]?.format(dateObj) || ''
}

export const formatOrderDate = (date: Date | string): string => {
  return formatDate(date, 'dateTime')
}

export const formatDeliveryDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (dateObj.toDateString() === today.toDateString()) return 'Today'
  if (dateObj.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return formatDate(dateObj, 'long')
}

export const formatTimeAgo = (date: Date | string): string => {
  return formatDate(date, 'relative')
}

export const calculateDaysBetween = (startDate: Date | string, endDate: Date | string): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const isDateInFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

export const isDateInPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}