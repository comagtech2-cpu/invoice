import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BusinessService from '../services/businessService';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ business: '', name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    if (id) {
      BusinessService.getClient(id).then(data => setForm(data)).catch(err => console.error(err));
    }
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await BusinessService.updateClient(id, form);
      } else {
        await BusinessService.createClient(form);
      }
      navigate('/clients');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{id ? 'Edit Client' : 'Create Client'}</h2>
      <form onSubmit={submit} className="max-w-md">
        <label className="block mt-2">Business ID</label>
        <input className="input" value={form.business || ''} onChange={e => setForm({...form, business: e.target.value})} />
        <label className="block mt-2">Name</label>
        <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <label className="block mt-2">Email</label>
        <input className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <label className="block mt-2">Phone</label>
        <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <label className="block mt-2">Address</label>
        <textarea className="input" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
        <div className="mt-4">
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
