import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import invoiceService from '../services/invoiceService';
import Spinner from './ui/Spinner';

export default function TemplatePreview() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    invoiceService.getTemplate(id).then(setTemplate).catch(err => console.error(err));
  }, [id]);

  if (!template) return <Spinner label="Loading template..." />;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{template.name}</h2>
      <p className="text-gray-600">{template.description}</p>
      <h3 className="mt-4 font-semibold">Defaults</h3>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(template.defaults, null, 2)}</pre>
      <h3 className="mt-4 font-semibold">HTML Preview</h3>
      <div className="border p-4 bg-white" dangerouslySetInnerHTML={{ __html: template.html_template || '<em>No HTML template provided</em>' }} />
    </div>
  );
}