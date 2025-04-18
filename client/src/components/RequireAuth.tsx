import React from 'react';
import { Navigate } from 'react-router-dom';

type Props = {
  children: React.ReactNode;
};

const RequireAuth = ({ children }: Props) => {
  const storedName = localStorage.getItem('userName');

  if (!storedName) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
