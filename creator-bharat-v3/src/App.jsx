import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from '@/AppRoutes';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';
import PWAUpdatePrompt from '@/components/common/PWAUpdatePrompt';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ENV } from '@/config/env';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Pre-warm backend on page load to wake up Render early
  useEffect(() => {
    const preWarmBackend = async () => {
      try {
        await fetch(`${ENV.apiUrl}/health`).catch(() => {});
      } catch (err) {
        // Silent catch to prevent console noise if offline
      }
    };
    preWarmBackend();
  }, []);

  return (
    <ErrorBoundary>
      <AppRoutes location={location} />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </ErrorBoundary>
  );
}
