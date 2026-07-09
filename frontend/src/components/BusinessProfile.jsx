import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import businessService from '../services/businessService';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';

const BusinessProfile = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    website: '',
    tax_id: '',
    logo: null
  });
  const [errors, setErrors] = useState({});

  // Load businesses when component mounts
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setIsLoading(true);
      const data = await businessService.getAllBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        setCurrentBusiness(data[0]);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setFormData({
      ...formData,
      logo: file || null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      let result;
      if (isEditing && currentBusiness) {
        result = await businessService.updateBusiness(currentBusiness.id, formData);
        // Update the business in the list
        setBusinesses(businesses.map(b => b.id === result.id ? result : b));
        setCurrentBusiness(result);
      } else {
        result = await businessService.createBusiness(formData);
        setBusinesses([...businesses, result]);
        setCurrentBusiness(result);
      }
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        phone_number: '',
        email: '',
        website: '',
        tax_id: ''
      });
      setIsEditing(false);
      setShowForm(false);
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({ general: error.error || 'Operation failed' });
      }
    }
  };

  const handleEdit = (business) => {
    setCurrentBusiness(business);
    setFormData({
      name: business.name,
      address: business.address || '',
      phone_number: business.phone_number || '',
      email: business.email || '',
      website: business.website || '',
      tax_id: business.tax_id || '',
      logo: null
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await businessService.deleteBusiness(id);
        setBusinesses(businesses.filter(b => b.id !== id));
        if (currentBusiness && currentBusiness.id === id) {
          setCurrentBusiness(businesses.length > 1 ? businesses[0] : null);
        }
      } catch (error) {
        setErrors({ general: error.error || 'Failed to delete business' });
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      address: '',
      phone_number: '',
      email: '',
      website: '',
      tax_id: ''
    });
    setIsEditing(false);
    setShowForm(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-3 py-2 mr-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <Building className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Business
          </button>
        </div>

        {errors.general && <ErrorBanner message={errors.general} />}

        {isLoading ? (
          <Spinner label="Loading businesses..." />
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No businesses found. Create your first business profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(business => (
              <div key={business.id} className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{business.name}</h3>
                <div className="flex items-start gap-4">
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={`${business.name} logo`} className="w-20 h-20 object-contain mr-4 rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">No Logo</div>
                  )}
                  <div className="space-y-2 text-gray-600">
                    {business.address && <p>{business.address}</p>}
                    {business.phone_number && <p>{business.phone_number}</p>}
                    {business.email && <p>{business.email}</p>}
                    {business.website && (
                      <p>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {business.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleEdit(business)}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(business.id)}
                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEditing ? 'Edit Business' : 'Add Business'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.name && <span className="text-red-600 text-sm mt-1 block">{errors.name}</span>}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                    <input
                      type="text"
                      id="tax_id"
                      name="tax_id"
                      value={formData.tax_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">Logo (optional)</label>
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full"
                    />
                    {formData.logo && (
                      <p className="text-sm text-gray-600 mt-2">Selected file: {formData.logo.name}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isEditing ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;