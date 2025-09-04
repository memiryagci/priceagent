import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <XCircle size={24} style={{ color: 'var(--error)' }} />;
      case 'warning':
        return <AlertCircle size={24} style={{ color: 'var(--warning)' }} />;
      case 'info':
        return <Info size={24} style={{ color: 'var(--info)' }} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
        return 'var(--info)';
    }
  };

  return (
    <div 
      className="toast-container"
      style={{
        background: 'var(--gradient-marble-soft)',
        border: `1px solid ${getTypeColor()}20`,
        borderLeft: `4px solid ${getTypeColor()}`,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '12px',
        boxShadow: 'var(--shadow-marble-medium)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '350px',
        maxWidth: '450px',
        animation: 'toastSlideIn 0.3s ease-out'
      }}
    >
      {/* Toast Icon */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {getIcon()}
      </div>

      {/* Toast Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: 'var(--font-primary)',
          margin: '0 0 4px 0',
          lineHeight: '1.4'
        }}>
          {title}
        </h4>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontFamily: 'var(--font-primary)',
          margin: 0,
          lineHeight: '1.4'
        }}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--marble-cloud)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: getTypeColor(),
          borderRadius: '0 0 16px 16px',
          animation: `toastProgress ${duration}ms linear`
        }}
      />

      {/* Marble Shimmer Effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          animation: 'marbleShimmer 2s ease-in-out infinite'
        }}
      />
    </div>
  );
};

export default Toast;
