import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context';

/**
 * ProtectedRoute: Ensures only authenticated users can access specific routes.
 * Redirects to /login if no user is found in context.
 * 
 * @param {React.ReactNode} children - The component to render if authenticated
 * @param {string} allowedRole - Optional. Only allow 'creator' or 'brand'
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const { st } = useApp();
  const location = useLocation();

  // If no user is logged in, redirect to login page
  if (!st.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user role doesn't match
  if (allowedRole && st.role !== allowedRole) {
    // Redirect creators to onboarding if they are incomplete, otherwise dashboard
    const fallbackPath = st.role === 'brand' ? '/brand-dashboard' : '/creator/onboarding';
    return <Navigate to={fallbackPath} replace />;
  }

  // If the user is a creator, ensure they have completed onboarding.
  // If their profile is incomplete, redirect them to /creator/onboarding (unless they are already going to onboarding or profile builder pages)
  if (st.user && st.role === 'creator') {
    const creatorProfile = st.user.creatorProfile || st.user.creator || {};
    const rawPhone = creatorProfile.phone || creatorProfile.contactPhone || st.user.phone || '';
    const hasIndianPhone = rawPhone && /^[6-9]\d{9}$/.test(String(rawPhone).replace(/\D/g, ''));
    const hasIndianLocation = Boolean(creatorProfile.state && creatorProfile.city);
    
    const isProfileIncomplete = !hasIndianPhone || !hasIndianLocation;
    
    if (isProfileIncomplete && location.pathname !== '/creator/onboarding' && location.pathname !== '/creator/profile' && location.pathname !== '/creator/profile-builder') {
      return <Navigate to="/creator/onboarding" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRole: PropTypes.string
};

export default ProtectedRoute;
