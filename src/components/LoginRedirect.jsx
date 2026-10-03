import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Sends unauthenticated visitors to the unified login, remembering where they were going.
export default function LoginRedirect() {
  const location = useLocation();
  const path = location.pathname + location.search;
  const qs = new URLSearchParams({ role: location.pathname.startsWith('/company') ? 'company' : 'candidate' });
  if (path !== '/') qs.set('returnTo', path);
  return <Navigate to={`/login?${qs.toString()}`} replace />;
}