// src/components/admin/BulkOperations.tsx - COMPLETE FIXED VERSION
import React, { useState } from 'react'
import { Upload, Download, Trash2, Edit, Filter, Check, X, AlertTriangle, Package } from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import toast from 'react-hot-toast'

interface BulkOperationsProps {
  type: 'products' | 'users' | 'orders'
  selectedItems: string[]
  onSuccess?: () => void
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  type,
  selectedItems,
  onSuccess,
}) => {
  const [operation, setOperation] = useState<'update' | 'delete' | 'export' | 'import'>('update')
  const [loading, setLoading] = useState(false)
  const [updateData, setUpdateData] = useState<any>({})
  const [importFile, setImportFile] = useState<File | null>(null)

  // ✅ FIXED: Bulk update handler
  const handleBulkUpdate = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to update')
      return
    }

    if (Object.keys(updateData).length === 0) {
      toast.error('Please specify update data')
      return
    }

    try {
      setLoading(true)
      
      let response: any
      
      // Only handle products for now
      if (type === 'products') {
        // Handle status update
        if (updateData.status && updateData.status !== '') {
          console.log('🔄 Bulk updating status:', updateData.status);
          response = await adminService.bulkUpdateStatus(
            selectedItems, 
            updateData.status as 'active' | 'inactive'
          )
          toast.success(`Updated status for ${response.data?.modifiedCount || 0} products`)
        }
        // Handle featured update
        else if (updateData.featured && updateData.featured !== '') {
          console.log('⭐ Bulk updating featured:', updateData.featured);
          response = await adminService.bulkUpdateFeatured(
            selectedItems, 
            updateData.featured === 'true'
          )
          toast.success(`Updated featured status for ${response.data?.modifiedCount || 0} products`)
        }
        // Handle other updates (category, discount, etc.)
        else {
          console.log('📝 Bulk updating general data:', updateData);
          
          // Prepare update data for general update
          const updatePayload: any = {}
          
          if (updateData.category && updateData.category.trim() !== '') {
            updatePayload.category = updateData.category.trim()
          }
          
          if (updateData.discount && !isNaN(updateData.discount)) {
            // If you want to set discount price, you need the original price
            // This is complex without fetching each product first
            toast.error('Discount update requires individual product handling')
            setLoading(false)
            return
          }
          
          // Only proceed if we have something to update
          if (Object.keys(updatePayload).length > 0) {
            response = await adminService.bulkUpdateProducts({
              productIds: selectedItems,
              updateData: updatePayload
            })
            toast.success(`Updated ${response.data?.modified || 0} products`)
          } else {
            toast.error('No valid update data provided')
            setLoading(false)
            return
          }
        }
      } else {
        toast.error(`Bulk update for ${type} not implemented yet`)
        setLoading(false)
        return
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form
      setUpdateData({})
      
    } catch (error: any) {
      console.error('Bulk update error:', error)
      toast.error(error.response?.data?.error || error.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} ${type}? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      
      let response: any
      
      if (type === 'products') {
        // Ask for delete type
        const deleteType = window.confirm('Permanently delete? Click OK for permanent delete, Cancel for soft delete.')
          ? 'hard'
          : 'soft'
        
        console.log(`🗑️ Bulk deleting ${selectedItems.length} products (type: ${deleteType})`)
        
        response = await adminService.bulkDeleteProducts({ 
          productIds: selectedItems,
          deleteType
        })
        
        const count = response.data?.modifiedCount || 0
        toast.success(`Deleted ${count} products (${deleteType} delete)`)
      } else {
        toast.error(`Bulk delete for ${type} not implemented yet`)
        setLoading(false)
        return
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (error: any) {
      console.error('Bulk delete error:', error)
      toast.error(error.response?.data?.error || error.message || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Import handler
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    try {
      setLoading(true)
      
      if (type === 'products') {
        // Read file
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string
            
            let products = []
            if (importFile.name.endsWith('.csv')) {
              // Parse CSV
              const lines = content.split('\n')
              const headers = lines[0].split(',')
              products = lines.slice(1).map(line => {
                const values = line.split(',')
                const product: any = {}
                headers.forEach((header, index) => {
                  product[header.trim()] = values[index]?.trim()
                })
                return product
              }).filter(p => Object.keys(p).length > 0)
            } else if (importFile.name.endsWith('.json')) {
              products = JSON.parse(content)
            }
            
            if (products.length === 0) {
              toast.error('No valid products found in file')
              setLoading(false)
              return
            }
            
            console.log(`📤 Importing ${products.length} products`)
            
            // Use importProducts if available, otherwise create individually
            let response
            if (adminService.importProducts) {
              response = await adminService.importProducts({ products })
              toast.success(`Imported ${response.data?.success || 0} products, ${response.data?.failed || 0} failed`)
            } else {
              // Fallback: create products one by one
              toast.info(`Creating ${products.length} products...`)
              const results = await Promise.allSettled(
                products.map((product: any) => {
                  const formData = new FormData()
                  // Convert product to form data
                  Object.keys(product).forEach(key => {
                    formData.append(key, product[key])
                  })
                  return adminService.createProduct(formData)
                })
              )
              
              const successful = results.filter(r => r.status === 'fulfilled').length
              const failed = results.filter(r => r.status === 'rejected').length
              
              toast.success(`Created ${successful} products, ${failed} failed`)
            }
            
            if (onSuccess) onSuccess()
            setImportFile(null)
            
          } catch (parseError: any) {
            console.error('Parse error:', parseError)
            toast.error(`Failed to parse file: ${parseError.message}`)
          }
        }
        
        reader.readAsText(importFile)
      } else {
        toast.error(`Import for ${type} not implemented yet`)
        setLoading(false)
      }
      
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.response?.data?.error || error.message || 'Import failed')
      setLoading(false)
    }
  }

  // ✅ FIXED: Export handler
  const handleExport = async () => {
    try {
      setLoading(true)
      
      let data: any
      switch (type) {
        case 'products':
          // Export selected products or all if none selected
          if (selectedItems.length > 0) {
            // Get details for selected products
            const productsResponse = await adminService.getAdminProducts({ limit: 1000 })
            const allProducts = productsResponse.data?.products || []
            data = {
              data: allProducts.filter((p: any) => selectedItems.includes(p._id))
            }
          } else {
            data = await adminService.getAdminProducts({ limit: 1000 })
          }
          break
        case 'orders':
          if (adminService.exportOrders) {
            data = await adminService.exportOrders()
          } else {
            data = await adminService.getAdminOrders({ limit: 1000 })
          }
          break
        case 'users':
          data = await adminService.getUsers({ limit: 1000 })
          break
        default:
          toast.error(`Export for ${type} not available`)
          setLoading(false)
          return
      }

      // Create and download file
      const json = JSON.stringify(data.data || data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      const count = selectedItems.length > 0 ? selectedItems.length : 'all'
      toast.success(`Exported ${count} ${type}`)
      
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.response?.data?.error || error.message || 'Export failed')
    } finally {
      setLoading(false)
    }
  }

  const renderOperationForm = () => {
    switch (operation) {
      case 'update':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Update Fields</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={updateData.status || ''}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured
                </label>
                <select
                  value={updateData.featured || ''}
                  onChange={(e) => setUpdateData({ ...updateData, featured: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={updateData.category || ''}
                  onChange={(e) => setUpdateData({ ...updateData, category: e.target.value })}
                  placeholder="Enter category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock (Set to)
                </label>
                <input
                  type="number"
                  min="0"
                  value={updateData.stock || ''}
                  onChange={(e) => setUpdateData({ ...updateData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="Stock quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={handleBulkUpdate}
              disabled={loading || selectedItems.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : `Update ${selectedItems.length} Selected`}
            </button>
          </div>
        )

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Warning: This action cannot be undone
                  </h4>
                  <p className="text-sm text-red-700">
                    You are about to delete {selectedItems.length} {type}. This will permanently remove them from the system.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={loading || selectedItems.length === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : `Delete ${selectedItems.length} Selected`}
            </button>
          </div>
        )

      case 'export':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Download className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Export Options
                  </h4>
                  <p className="text-sm text-blue-700">
                    Export will include {selectedItems.length > 0 ? 'selected items' : 'all items'} in JSON format.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        )

      case 'import':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start">
                <Upload className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-1">
                    Import Data
                  </h4>
                  <p className="text-sm text-purple-700">
                    Upload a CSV or JSON file containing {type} data. Make sure the file follows the required format.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id="import-file"
                  accept=".csv,.json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {importFile ? importFile.name : 'Click to upload file'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports: CSV, JSON (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>
              {importFile && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    onClick={() => setImportFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={loading || !importFile}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Operations</h2>
            <p className="text-gray-600 mt-1">
              {selectedItems.length} {type} selected
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
          </div>
        </div>
      </div>

      {/* Operation Selection */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setOperation('update')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              operation === 'update'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Edit className="h-6 w-6 mx-auto mb-2" />
            <span className="font-medium">Update</span>
          </button>
          <button
            onClick={() => setOperation('delete')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              operation === 'delete'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Trash2 className="h-6 w-6 mx-auto mb-2" />
            <span className="font-medium">Delete</span>
          </button>
          <button
            onClick={() => setOperation('export')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              operation === 'export'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Download className="h-6 w-6 mx-auto mb-2" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => setOperation('import')}
            className={`p-4 rounded-lg border-2 text-center transition-colors ${
              operation === 'import'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Upload className="h-6 w-6 mx-auto mb-2" />
            <span className="font-medium">Import</span>
          </button>
        </div>

        {/* Operation Form */}
        <div className="bg-gray-50 rounded-lg p-6">
          {renderOperationForm()}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            How to use bulk operations
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Select items from the table using checkboxes</li>
            <li>• Choose an operation from above</li>
            <li>• Configure the operation settings</li>
            <li>• Apply to all selected items</li>
            <li>• Bulk operations may take time for large datasets</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BulkOperations