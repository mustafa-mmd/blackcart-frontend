import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      />
    </div>
  )
}

export default Loader