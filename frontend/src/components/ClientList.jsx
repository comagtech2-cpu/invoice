import React, { useEffect, useState } from 'react';
import BusinessService from '../services/businessService';
import { Link } from 'react-router-dom';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    BusinessService.getClients()
      .then(data => setClients(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Link to="/clients/create" className="btn btn-primary">Create Client</Link>
      </div>

      {loading ? (
        <Spinner label="Loading clients..." />
      ) : (
        <>
          {error && <ErrorBanner message={error?.message || 'Error loading clients'} />}

          <ul className="space-y-2">
            {clients.map(c => (
              <li key={c.id} className="py-3 px-3 bg-white rounded shadow-sm flex items-center justify-between">
                <div>
                  <Link to={`/clients/${c.id}`} className="text-blue-600 font-medium">{c.name}</Link>
                  {c.email && <div className="text-sm text-gray-600">{c.email}</div>}
                </div>
                <div>
                  <Link to={`/clients/${c.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
