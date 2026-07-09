import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BusinessService from '../services/businessService';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    BusinessService.getClient(id)
      .then(data => setClient(data))
      .catch(err => setError(err?.message || 'Failed to load client'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading client..." />;
  if (error) return <div className="p-4"><ErrorBanner message={error} /></div>;
  if (!client) return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Client Not Found</h2>
      <Link to="/clients" className="btn-secondary mt-2 inline-block">Back to Clients</Link>
    </div>
  );
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{client.name}</h2>
      <p className="text-gray-700">{client.email}</p>
      <p className="text-gray-700">{client.phone}</p>
      <p className="text-gray-700">{client.address}</p>
      <div className="mt-4">
        <Link to={`/clients/${id}/edit`} className="btn btn-secondary mr-2">Edit</Link>
      </div>
    </div>
  );
}
