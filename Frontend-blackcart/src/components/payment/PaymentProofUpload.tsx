// src/components/payment/PaymentProofUpload.tsx
import React, { useState } from 'react'
import { Upload, Image, FileText, AlertCircle, Check } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { formatDate } from '../../utils/dateFormatter'

interface PaymentProofUploadProps {
  orderId: string
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: {
    transactionRef?: string
    bankName?: string
    transactionDate?: string
    notes?: string
  }
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  orderId,
  onSuccess,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    transactionRef: initialData?.transactionRef || '',
    bankName: initialData?.bankName || '',
    transactionDate: initialData?.transactionDate || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
  })
  const [proofImage, setProofImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { uploadPaymentProof } = useOrders()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, etc.)')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setProofImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!proofImage) {
      alert('Please upload a payment proof image')
      return
    }

    if (!formData.transactionRef || !formData.bankName || !formData.transactionDate) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setUploading(true)
      await uploadPaymentProof(orderId, {
        ...formData,
        proofImage,
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const popularBanks = [
    'Habib Bank Limited (HBL)',
    'United Bank Limited (UBL)',
    'National Bank of Pakistan (NBP)',
    'MCB Bank',
    'Allied Bank Limited (ABL)',
    'Bank Alfalah',
    'Faysal Bank',
    'Meezan Bank',
    'Standard Chartered Bank',
    'Dubai Islamic Bank Pakistan',
    'Other',
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <FileText className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Upload Payment Proof</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Reference / ID *
          </label>
          <input
            type="text"
            name="transactionRef"
            value={formData.transactionRef}
            onChange={handleInputChange}
            placeholder="Enter transaction ID or reference number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the transaction ID from your bank receipt
          </p>
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name *
          </label>
          <select
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select Bank</option>
            {popularBanks.map(bank => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        {/* Transaction Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Date *
          </label>
          <input
            type="date"
            name="transactionDate"
            value={formData.transactionDate}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        {/* Payment Proof Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Proof Image *
          </label>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="proof-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative w-48 h-48 mx-auto">
                  <img
                    src={previewUrl}
                    alt="Payment proof preview"
                    className="w-full h-full object-contain border border-gray-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage(null)
                      setPreviewUrl(null)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  <Check className="h-4 w-4 inline mr-1" />
                  Image selected
                </p>
              </div>
            ) : (
              <label htmlFor="proof-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Click to upload payment proof
                  </p>
                  <p className="text-xs text-gray-500">
                    Upload a clear photo of your bank receipt or transaction screenshot
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports: JPG, PNG (Max 5MB)
                  </p>
                </div>
              </label>
            )}
          </div>
          
          {proofImage && (
            <p className="mt-2 text-sm text-gray-500">
              File: {proofImage.name} ({(proofImage.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional information about your payment..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Requirements */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Important Requirements
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Upload clear, readable image of bank receipt/screenshot</li>
                <li>• Include transaction ID, date, and amount in the image</li>
                <li>• Keep the transaction details matching with order amount</li>
                <li>• Verification usually takes 24-48 hours</li>
                <li>• You will be notified via email once verified</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={!proofImage || uploading}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${
              !proofImage || uploading
                ? 'bg-blue-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {uploading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </span>
            ) : (
              'Submit Payment Proof'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PaymentProofUpload