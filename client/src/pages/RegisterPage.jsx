import React from 'react';
import { Navigate } from 'react-router-dom';

const RegisterPage = () => {
  return <Navigate to="/login?mode=register" replace />;
};

export default RegisterPage;
