import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building, User, Calendar, Plus, Trash2, ArrowLeft } from 'lucide-react';
import businessService from '../services/businessService';
import invoiceService from '../services/invoiceService';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState(null);

  const [invoiceData, setInvoiceData] = useState({
    business: '',
    template_id: null,
    client_name: '',
    client_email: '',
    client_address: '',
    client_phone: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0], // Default to issue date
    currency: 'NGN',
    tax_rate: 0,
    notes: '',
    line_items: [
      { description: '', quantity: 1, unit_price: 0 }
    ]
  });

  // Load businesses when component mounts
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const data = await businessService.getAllBusinesses();
        setBusinesses(data);
        if (data.length > 0) {
          setInvoiceData(prev => ({
            ...prev,
            business: data[0].id
          }));
          // Load templates for the first business
          setLoadingTemplates(true);
          setTemplatesError(null);
          try {
            const templatesRes = await invoiceService.getTemplates(data[0].id);
            setTemplates(templatesRes);
          } catch (err) {
            console.error('Failed to load templates for initial business', err);
            setTemplates([]);
            setTemplatesError('Failed to load templates');
          } finally {
            setLoadingTemplates(false);
          }
        }
      } catch (error) {
        console.error('Failed to load businesses or templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const handleInputChange = (e) => {
    setInvoiceData({
      ...invoiceData,
      [e.target.name]: e.target.value
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedLineItems = [...invoiceData.line_items];
    updatedLineItems[index][field] = value;
    setInvoiceData({
      ...invoiceData,
      line_items: updatedLineItems
    });
  };

  const addLineItem = () => {
    setInvoiceData({
      ...invoiceData,
      line_items: [
        ...invoiceData.line_items,
        { description: '', quantity: 1, unit_price: 0 }
      ]
    });
  };

  const removeLineItem = (index) => {
    if (invoiceData.line_items.length > 1) {
      const updatedLineItems = [...invoiceData.line_items];
      updatedLineItems.splice(index, 1);
      setInvoiceData({
        ...invoiceData,
        line_items: updatedLineItems
      });
    }
  };

  const calculateLineItemTotal = (item) => {
    return item.quantity * item.unit_price;
  };

  const calculateSubtotal = () => {
    return invoiceData.line_items.reduce(
      (sum, item) => sum + calculateLineItemTotal(item), 0
    );
  };

  const calculateTaxAmount = () => {
    return calculateSubtotal() * (invoiceData.tax_rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'NGN': '₦',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'Fr',
      'CNY': '¥',
      'INR': '₹'
    };
    return symbols[currency] || '₦';
  };

  // Utility to get a readable error message from various shapes returned by the API
  const getErrorMessage = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val[0] || null;
    if (typeof val === 'object') {
      // Try to extract a nested message (common DRF shapes)
      if (val.non_field_errors) return getErrorMessage(val.non_field_errors);
      const firstKey = Object.keys(val)[0];
      return getErrorMessage(val[firstKey]) || JSON.stringify(val);
    }
    return String(val);
  };

  // Safe wrapper so rendering never receives an object (protects against unexpected shapes)
  const safeGetErrorMessage = (val) => {
    try {
      const msg = getErrorMessage(val);
      // Ensure msg is a primitive/string before returning
      if (msg && typeof msg === 'object') {
        try {
          return JSON.stringify(msg);
        } catch (e) {
          return 'An error occurred';
        }
      }
      if (!msg && typeof val === 'object') {
        // Fallback to stringify original value
        try {
          return JSON.stringify(val);
        } catch (e) {
          return 'An error occurred';
        }
      }
      return msg;
    } catch (e) {
      console.error('Error formatting server message', e, val);
      return 'An error occurred';
    }
  };

  // Log any changes to errors for debugging
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.debug('CreateInvoice errors state:', errors);
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await invoiceService.createInvoice(invoiceData);
      navigate('/invoices');
    } catch (err) {
      // Normalize common DRF shapes into an errors object that maps field -> messages or general -> message
      if (!err) {
        setErrors({ general: 'Failed to create invoice' });
        return;
      }

      // If server returned a shape with top-level 'errors'
      if (err.errors && typeof err.errors === 'object') {
        setErrors(err.errors);
        return;
      }

      // If server wrapped errors under `invoice` (some serializers return { invoice: {...} })
      if (err.invoice && typeof err.invoice === 'object') {
        setErrors(err.invoice);
        return;
      }

      // If server returned field-specific errors in the top-level object, keep them
      if (typeof err === 'object' && Object.keys(err).length > 0 && !err.error) {
        // Convert values that are objects into strings to avoid rendering objects as React children
        const normalized = {};
        Object.entries(err).forEach(([k, v]) => {
          normalized[k] = v;
        });
        setErrors(normalized);
        return;
      }

      // Otherwise fall back to a general message
      console.error('Create invoice error:', err);
      const generalMsg = err.error ? getErrorMessage(err.error) : getErrorMessage(err) || 'Failed to create invoice';
      setErrors({ general: generalMsg });
    }
  };

  if (loading) {
    return <Spinner label="Loading businesses..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <FileText className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          </div>
          <button
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </button>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {safeGetErrorMessage(errors.general)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <Building className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
            </div>
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">Business *</label>
              <select
                id="business"
                name="business"
                value={invoiceData.business}
                onChange={async (e) => {
                  const businessId = e.target.value;
                  setInvoiceData(prev => ({...prev, business: businessId, template_id: null}));
                  setLoadingTemplates(true);
                  setTemplatesError(null);
                  try {
                    const t = await invoiceService.getTemplates(businessId);
                    setTemplates(t);
                  } catch (err) {
                    console.error('Failed to load templates for business', err);
                    setTemplates([]);
                    setTemplatesError('Failed to load templates');
                  } finally {
                    setLoadingTemplates(false);
                  }
                }}
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mt-4 mb-2">Template (optional)</label>
              <select id="template" name="template" value={invoiceData.template_id || ''} onChange={async (e) => {
                const id = e.target.value || null;
                setInvoiceData({...invoiceData, template_id: id});
                if (id) {
                  try {
                    const tmpl = await invoiceService.getTemplate(id);
                    // Merge template defaults into invoice data. Only set fields that are not provided by the user yet.
                    setInvoiceData(prev => ({
                      ...prev,
                      line_items: tmpl.defaults?.line_items || prev.line_items,
                      tax_rate: tmpl.defaults?.tax_rate ?? prev.tax_rate,
                      currency: tmpl.defaults?.currency || prev.currency,
                      notes: tmpl.defaults?.notes || prev.notes,
                    }));
                  } catch (err) {
                    console.error('Failed to load template', err);
                  }
                }
              }}>
                <option value="">-- Select Template --</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div className="mt-2">
                {loadingTemplates ? (
                  <div className="mt-2"><Spinner label="Loading templates..." /></div>
                ) : templatesError ? (
                  <div className="text-sm text-red-500">{templatesError}</div>
                ) : templates && templates.length ? (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {templates.map(t => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={async () => {
                          setInvoiceData(prev => ({...prev, template_id: t.id}));
                          try {
                            const tmpl = await invoiceService.getTemplate(t.id);
                            setInvoiceData(prev => ({
                              ...prev,
                              line_items: tmpl.defaults?.line_items || prev.line_items,
                              tax_rate: tmpl.defaults?.tax_rate ?? prev.tax_rate,
                              currency: tmpl.defaults?.currency || prev.currency,
                              notes: tmpl.defaults?.notes || prev.notes,
                            }));
                          } catch (err) {
                            console.error('Failed to load template', err);
                          }
                        }}
                        className={`px-3 py-1 rounded border ${invoiceData.template_id === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                        aria-pressed={invoiceData.template_id === t.id}
                        aria-label={`Select template ${t.name}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-2">No templates available</div>
                )}
              </div>
              {errors.business && (
                <p className="text-red-600 text-sm mt-1">{safeGetErrorMessage(errors.business)}</p>
              )}
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={invoiceData.client_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.client_name && (
                  <p className="text-red-600 text-sm mt-1">{safeGetErrorMessage(errors.client_name)}</p>
                )}
              </div>
              <div>
                <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                <input
                  type="email"
                  id="client_email"
                  name="client_email"
                  value={invoiceData.client_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="client_address" className="block text-sm font-medium text-gray-700 mb-2">Client Address</label>
              <textarea
                id="client_address"
                name="client_address"
                value={invoiceData.client_address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
              <input
                type="text"
                id="client_phone"
                name="client_phone"
                value={invoiceData.client_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-2">Issue Date *</label>
                <input
                  type="date"
                  id="issue_date"
                  name="issue_date"
                  value={invoiceData.issue_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.issue_date && (
                  <p className="text-red-600 text-sm mt-1">{safeGetErrorMessage(errors.issue_date)}</p>
                )}
              </div>
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={invoiceData.due_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.due_date && (
                  <p className="text-red-600 text-sm mt-1">{safeGetErrorMessage(errors.due_date)}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
                <select
                  id="currency"
                  name="currency"
                  value={invoiceData.currency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="CAD">Canadian Dollar (C$)</option>
                  <option value="AUD">Australian Dollar (A$)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                  <option value="CHF">Swiss Franc (Fr)</option>
                  <option value="CNY">Chinese Yuan (¥)</option>
                  <option value="INR">Indian Rupee (₹)</option>
                </select>
              </div>
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={invoiceData.tax_rate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={invoiceData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            {errors.line_items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                {safeGetErrorMessage(errors.line_items)}
              </div>
            )}
            {invoiceData.line_items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Item {index + 1}</h4>
                  {invoiceData.line_items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="inline-flex items-center px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                    <input
                      type="text"
                      value={`${getCurrencySymbol(invoiceData.currency)}${calculateLineItemTotal(item).toFixed(2)}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">{getCurrencySymbol(invoiceData.currency)}{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax ({invoiceData.tax_rate}%):</span>
                <span className="font-medium">{getCurrencySymbol(invoiceData.currency)}{calculateTaxAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-indigo-600">{getCurrencySymbol(invoiceData.currency)}{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;