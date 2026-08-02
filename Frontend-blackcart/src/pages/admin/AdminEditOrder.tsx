// src/pages/admin/AdminEditOrder.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { adminService } from '../../services/adminServiceMethods';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { useQueryClient } from '@tanstack/react-query';

// ✅ Pakistani Courier Companies
const COURIER_SERVICES = [
  { value: 'TCS', label: 'TCS — Express Delivery' },
  { value: 'PostEx', label: 'PostEx — Normal Delivery' },
];

const CUSTOM_COURIER_VALUE = 'custom';

const AdminEditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    orderStatus: '',
    trackingNumber: '',
    shippingCarrier: '',
    notes: ''
  });
  const [courierOption, setCourierOption] = useState('');
  const [customCarrierName, setCustomCarrierName] = useState('');
  const [noteLength, setNoteLength] = useState(0);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminOrderById(id!);
      const orderData = response.data;
      setOrder(orderData);
      
      // Get the latest notes or empty string
      const latestNotes = orderData.notes || '';
      const savedCarrier = orderData.shippingCarrier?.trim() || '';
      const isPresetCarrier = COURIER_SERVICES.some(
        (courier) => courier.value === savedCarrier,
      );
      
      setFormData({
        orderStatus: orderData.orderStatus,
        trackingNumber: orderData.trackingNumber || '',
        shippingCarrier: savedCarrier,
        notes: latestNotes
      });
      setCourierOption(
        isPresetCarrier
          ? savedCarrier
          : savedCarrier
            ? CUSTOM_COURIER_VALUE
            : '',
      );
      setCustomCarrierName(isPresetCarrier ? '' : savedCarrier);
      setNoteLength(latestNotes.length);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setSaving(true);

    const carrierName = formData.shippingCarrier.trim();
    if (courierOption === CUSTOM_COURIER_VALUE && !carrierName) {
      toast.error('Enter the service provider name');
      setSaving(false);
      return;
    }
    
    // Prepare update data - MUST match what updateOrderStatus expects
    const updateData: any = {};

    // Status change (required)
    if (formData.orderStatus !== order.orderStatus) {
      updateData.status = formData.orderStatus; // ✅ This is correct
    }

    // Tracking number (optional)
    if (formData.trackingNumber !== order.trackingNumber) {
      updateData.trackingNumber = formData.trackingNumber; // ✅ This is correct
    }

    // Carrier (optional)
    if (carrierName !== (order.shippingCarrier || '').trim()) {
      updateData.carrier = carrierName; // ✅ This is correct
    }

    // Notes (optional)
    if (formData.notes !== order.notes) {
      updateData.notes = formData.notes.length > 1950 
        ? formData.notes.substring(0, 1950) + '... (truncated)'
        : formData.notes; // ✅ This is correct
    }
    
    console.log('📤 Sending update data:', updateData);
    
    // If nothing changed, just go back
    if (Object.keys(updateData).length === 0) {
      toast.success('No changes made');
      navigate(`/admin/orders/${id}`);
      return;
    }
    
    // ✅ This will now call the correct endpoint
    const response = await adminService.updateAdminOrder(id!, updateData);
    console.log('✅ Update successful:', response);
    
    // Clear caches
    queryClient.removeQueries({ queryKey: ['order', id] });
    queryClient.removeQueries({ queryKey: ['adminOrders'] });
    queryClient.removeQueries({ queryKey: ['userOrders'] });
    
    queryClient.invalidateQueries({ queryKey: ['order', id] });
    queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    
    toast.success('Order updated successfully');
    
    setTimeout(() => {
      navigate(`/admin/orders/${id}`);
    }, 100);
    
  } catch (error: any) {
    console.error('❌ Error updating order:', error);
    console.error('❌ Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to update order';
    toast.error(errorMessage);
  } finally {
    setSaving(false);
  }
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'notes') {
      setNoteLength(value.length);
    }
  };

  const handleCourierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourier = e.target.value;
    setCourierOption(selectedCourier);
    setFormData((current) => ({
      ...current,
      shippingCarrier:
        selectedCourier === CUSTOM_COURIER_VALUE
          ? customCarrierName
          : selectedCourier,
    }));
  };

  const handleCustomCarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const providerName = e.target.value;
    setCustomCarrierName(providerName);
    setFormData((current) => ({
      ...current,
      shippingCarrier: providerName,
    }));
  };

  if (loading) {
    return <Loader size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/admin/orders/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Order
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Order #{order?.invoiceNumber}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                name="orderStatus"
                value={formData.orderStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tracking Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tracking number (e.g., TCS-123456789)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the tracking number provided by the courier company
              </p>
            </div>

            {/* Courier service provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courier Service Provider
              </label>
              <select
                name="courierOption"
                value={courierOption}
                onChange={handleCourierChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a service provider</option>
                {COURIER_SERVICES.map((courier) => (
                  <option key={courier.value} value={courier.value}>
                    {courier.label}
                  </option>
                ))}
                <option value={CUSTOM_COURIER_VALUE}>
                  Other — Enter provider name
                </option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                TCS handles Express Delivery; PostEx handles Normal Delivery.
              </p>

              {courierOption === CUSTOM_COURIER_VALUE && (
                <div className="mt-4">
                  <label
                    htmlFor="customCarrierName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Service Provider Name
                  </label>
                  <input
                    id="customCarrierName"
                    type="text"
                    value={customCarrierName}
                    onChange={handleCustomCarrierChange}
                    maxLength={80}
                    required
                    autoFocus
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type the courier or service provider name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will appear in the order's tracking information.
                  </p>
                </div>
              )}
            </div>

            {/* Notes Textarea with Character Counter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <span className={`text-xs ${noteLength > 1900 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                  {noteLength}/2000
                </span>
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add admin notes (e.g., delivery instructions, customer updates)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Notes are saved to order history and visible to customers
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/admin/orders/${id}`)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditOrder;
