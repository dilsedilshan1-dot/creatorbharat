import React from 'react';
import PropTypes from 'prop-types';
import * as Sentry from '@sentry/react';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical UI Crash caught by Boundary:", error, errorInfo);
    // Report to Sentry if DSN is configured
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          color: '#fff',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '64px', 
              background: 'linear-gradient(135deg, #FF9431, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900
            }}>
              Oops!
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.5px' }}>
                Elite Interface Encountered an Issue
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.6 }}>
                A small part of the ecosystem failed to load correctly. Don't worry, your data is safe.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ef4444',
                width: '100%',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: '100px'
              }}>
                {this.state.error?.message || this.state.error?.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: '#FF9431',
                  color: '#000',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '50px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '13px'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Reload Page
              </button>
              <button 
                onClick={() => { window.location.href = '/'; }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 28px',
                  borderRadius: '50px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '13px'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Return to Home
              </button>
            </div>
          </div>
          
          <style>{`
            h1 { font-weight: 800; }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
