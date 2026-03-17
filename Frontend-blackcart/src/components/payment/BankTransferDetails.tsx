// src/components/payment/BankTransferDetails.tsx
import React, { useState } from 'react'
import { Copy, Check, Download, Upload, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BankTransferDetailsProps {
  bankDetails: any
  orderId: string
  amount: number
  onProofUpload: (file: File) => void
}

const BankTransferDetails: React.FC<BankTransferDetailsProps> = ({
  bankDetails,
  orderId,
  amount,
  onProofUpload
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success(`${field} copied!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onProofUpload(selectedFile)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Account Details</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Bank Name:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankDetails.bankName}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.bankName, 'Bank Name')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedField === 'Bank Name' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Account Name:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankDetails.accountName}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.accountName, 'Account Name')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedField === 'Account Name' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Account Number:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankDetails.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedField === 'Account Number' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">IBAN:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankDetails.iban}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.iban, 'IBAN')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedField === 'IBAN' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">SWIFT Code:</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{bankDetails.swiftCode}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.swiftCode, 'SWIFT Code')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedField === 'SWIFT Code' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <span className="text-gray-600">Amount to Transfer:</span>
            <span className="font-bold text-lg">PKR {amount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Transaction Ref:</span>
            <div className="flex items-center">
              <span className="font-mono text-sm mr-2">{bankDetails.transactionRef}</span>
              <button
                onClick={() => copyToClipboard(bankDetails.transactionRef, 'Reference')}
                className="text-blue-600 hover:text-blue-700"
              >
                {copiedField === 'Reference' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Proof */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Payment Proof</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="proof-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <label
            htmlFor="proof-upload"
            className="cursor-pointer block"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Click to upload payment proof
            </p>
            <p className="text-xs text-gray-500">
              Screenshot of successful transaction
            </p>
          </label>

          {selectedFile && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Selected: {selectedFile.name}
              </p>
            </div>
          )}
        </div>

        {selectedFile && (
          <button
            onClick={handleUpload}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Upload Proof & Complete Order
          </button>
        )}

        <div className="mt-4 flex items-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Payment must be completed within 24 hours</span>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important:</h4>
            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
              <li>• Transfer the exact amount shown above</li>
              <li>• Include the transaction reference in description</li>
              <li>• Upload proof within 24 hours</li>
              <li>• Order will be processed after verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankTransferDetails