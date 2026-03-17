// src/pages/orders/InvoiceGenerator.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// This is a dummy page - redirect to real orders
const InvoiceGenerator: React.FC = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Redirect to orders page
    navigate('/orders')
  }, [navigate])
  
  return null
}

export default InvoiceGenerator