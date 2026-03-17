
// src/pages/user/AddressBook.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, Star, Loader } from 'lucide-react';
import { useAddress } from '../../context/AddressContext';
import { useAddressForm } from '../../hooks/useAddressForm';
import { IAddress } from '../../types/address.types';
import toast from 'react-hot-toast';

const AddressBook: React.FC = () => {
  const { 
    addresses, 
    loading, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useAddress();

  const [isAdding, setIsAdding] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<IAddress | null>(null);

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleTypeChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
    setFormData
  } = useAddressForm({
    initialData: editingAddress,
    onSubmit: async (data) => {
      try {
        if (editingAddress) {
          const result = await updateAddress(editingAddress._id, data);
          if (result.success) {
            toast.success('Address updated successfully');
            handleCancel();
          }
          return result;
        } else {
          const result = await addAddress(data);
          if (result.success) {
            toast.success('Address added successfully');
            handleCancel();
          }
          return result;
        }
      } catch (error: any) {
        toast.error(error.message || 'Operation failed');
        throw error;
      }
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        type: editingAddress.type || 'home',
        name: editingAddress.name || '',
        phone: editingAddress.phone || '',
        address: editingAddress.address || '',
        city: editingAddress.city || '',
        province: editingAddress.province || '',
        postalCode: editingAddress.postalCode || '',
        country: editingAddress.country || 'Pakistan',
        isDefault: editingAddress.isDefault || false
      });
    }
  }, [editingAddress, setFormData]);

  const handleEdit = (address: IAddress) => {
    setEditingAddress(address);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAddress(null);
    resetForm();
    setFormData({
      type: 'home',
      name: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Pakistan',
      isDefault: false
    });
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast.error('Cannot delete default address. Set another as default first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const result = await deleteAddress(id);
      if (result.success) {
        toast.success('Address deleted successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const result = await setDefaultAddress(id);
      if (result.success) {
        toast.success('Default address updated');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default address');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-5 w-5 text-blue-600" />;
      case 'office': return <Briefcase className="h-5 w-5 text-green-600" />;
      default: return <MapPin className="h-5 w-5 text-purple-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
  console.log('Getting label for type:', type); // Add this to debug
  switch (type) {
    case 'home': return 'Home';
    case 'office': return 'Office';
    case 'other': return 'Other';
    default: return 'Other';
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <MapPin className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Address Book</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Manage your delivery addresses for faster checkout
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add/Edit Address Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl p-8 shadow-lg mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Address Type</label>
                  <div className="flex gap-4">
                    {(['home', 'office', 'other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeChange(type)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                          formData.type === type
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                        disabled={isSubmitting}
                      >
                        {getTypeIcon(type)}
                        <span>{getTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ali Khan"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+92 300 1234567"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="House 123, Street 45, Area Name"
                      disabled={isSubmitting}
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Karachi"
                      disabled={isSubmitting}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      name="province"
                      value={formData.province || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.province ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select Province</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                      <option value="Azad Kashmir">Azad Kashmir</option>
                      <option value="Islamabad Capital Territory">Islamabad</option>
                    </select>
                    {errors.province && (
                      <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="75500"
                      maxLength={5}
                      disabled={isSubmitting}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="defaultAddress"
                    checked={formData.isDefault || false}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="defaultAddress" className="text-gray-700">
                    Set as default delivery address
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        {editingAddress ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingAddress ? 'Update Address' : 'Add Address'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Address
              </button>
            )}
          </div>

          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address, index) => (
                <motion.div
                  key={address._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl p-6 shadow-lg border-2 ${address.isDefault ? 'border-blue-500' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(address.type)}
                      <div>
                        <h3 className="font-bold text-gray-900">{address.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(address.type)}</span>
                      </div>
                    </div>
                    
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <Star className="h-3 w-3 fill-blue-800" />
                        Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-gray-700">{address.address}</p>
                    <p className="text-gray-700">{address.city}, {address.province}</p>
                    {address.postalCode && (
                      <p className="text-gray-700">{address.postalCode}</p>
                    )}
                    <p className="text-gray-700">{address.phone}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    
                    {!address.isDefault ? (
                      <>
                        <button
                          onClick={() => handleSetDefault(address._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-lg transition-colors"
                        >
                          <Star className="h-4 w-4" />
                          Set Default
                        </button>
                        <button
                          onClick={() => handleDelete(address._id, address.isDefault)}
                          className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex-1" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-xl shadow-lg"
            >
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No addresses saved</h3>
              <p className="text-gray-600 mb-6">Add your first delivery address for faster checkout</p>
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Your First Address
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBook;