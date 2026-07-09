import React from 'react';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded" role="alert">
      {message}
    </div>
  );
}
