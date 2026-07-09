import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';

export default function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    invoiceService.getTemplates()
      .then(data => setTemplates(data))
      .catch(err => setError(err?.message || 'Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4"><Spinner label="Loading templates..." /></div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Invoice Templates</h2>
        <Link to="/templates/create" className="btn btn-primary">Create Template</Link>
      </div>
      {error && <ErrorBanner message={error} />}

      {templates.length === 0 ? (
        <div className="p-6 bg-white rounded shadow-sm text-center">
          <p className="mb-3 text-gray-600">No templates found.</p>
          <Link to="/templates/create" className="btn-primary">Create a template</Link>
        </div>
      ) : (
        <ul>
          {templates.map(t => (
            <li key={t.id} className="py-2 border-b flex items-center justify-between">
              <div>
                <Link to={`/templates/${t.id}`} className="text-blue-600 font-medium">{t.name}</Link>
                <div className="text-sm text-gray-600">{t.description}</div>
              </div>
              <div>
                <Link to={`/templates/${t.id}/edit`} className="btn btn-secondary mr-2">Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
