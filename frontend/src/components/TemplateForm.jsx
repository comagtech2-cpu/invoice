import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import Spinner from './ui/Spinner';
import ErrorBanner from './ui/ErrorBanner';

export default function TemplateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [form, setForm] = useState({ business: '', name: '', description: '', defaults: {}, html_template: '' });

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      setFetchError(null);
      invoiceService.getTemplate(id)
        .then(data => setForm(data))
        .catch(err => setFetchError(err?.message || 'Failed to load template'))
        .finally(() => setIsFetching(false));
    }
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await invoiceService.updateTemplate(id, form);
      } else {
        await invoiceService.createTemplate(form);
      }
      navigate('/templates');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (isFetching) return <Spinner label="Loading template..." />;
  if (fetchError) return <div className="p-4"><ErrorBanner message={fetchError} /></div>;

  return (
    <div className="p-4 max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">{id ? 'Edit Template' : 'Create Template'}</h2>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">Name</label>
        <input className="input" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />


        <label className="block">Description</label>
        <textarea className="input" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />

        <label className="block">Defaults (JSON)</label>
        <textarea className="input" value={JSON.stringify(form.defaults || {}, null, 2)} onChange={e => {
          try {
            setForm({...form, defaults: JSON.parse(e.target.value)});
          } catch (err) {
            // ignore JSON parse errors during edit
            setForm({...form, defaults: form.defaults});
          }
        }} />

        <label className="block">HTML Template (optional)</label>
        <textarea className="input" value={form.html_template || ''} onChange={e => setForm({...form, html_template: e.target.value})} />

        <div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
