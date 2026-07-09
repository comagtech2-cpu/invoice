import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full sm:w-auto flex items-center justify-center">
      <Home className="w-4 h-4 mr-2" /> Dashboard
    </button>
  );
};

export default HomeButton;