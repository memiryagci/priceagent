import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Play, Square, RefreshCw, FileText } from 'lucide-react';
import api from '../services/api';

const TestPage = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [testUrl, setTestUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Status'u periyodik olarak güncelle
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(async () => {
        try {
          const response = await api.get('/test/status');
          if (response.data.success) {
            setStatus(response.data.status);
            setIsRunning(response.data.status.isRunning);
          }
        } catch (error) {
          console.error('Status güncelleme hatası:', error);
        }
      }, 2000); // Her 2 saniyede güncelle
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const startTest = async () => {
    if (!testUrl.trim()) {
      showError('Hata', 'Test URL\'i giriniz');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/test/start', { testUrl });
      if (response.data.success) {
        showSuccess('Test Başlatıldı', 'Cron test sistemi çalışmaya başladı');
        setIsRunning(true);
        setStatus(response.data.status);
      } else {
        showError('Hata', response.data.message);
      }
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Test başlatılamadı');
    } finally {
      setLoading(false);
    }
  };

  const stopTest = async () => {
    setLoading(true);
    try {
      const response = await api.post('/test/stop');
      if (response.data.success) {
        showInfo('Test Durduruldu', 'Cron test sistemi durduruldu');
        setIsRunning(false);
        setStatus(response.data.status);
      } else {
        showError('Hata', response.data.message);
      }
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Test durdurulamadı');
    } finally {
      setLoading(false);
    }
  };

  const refreshLogs = async () => {
    try {
      const response = await api.get('/test/logs');
      if (response.data.success) {
        setLogs(response.data.logs);
        showInfo('Loglar Güncellendi', `${response.data.logs.length} log kaydı alındı`);
      }
    } catch (error) {
      showError('Hata', 'Loglar alınamadı');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div className="marble-card" style={{
        background: 'var(--gradient-marble-soft)',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: 'var(--shadow-marble-medium)',
        border: '1px solid var(--border-light)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
          margin: '0 0 1rem 0'
        }}>
          Cron Test Sistemi
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          20 saniyede fiyat kontrolü, 40 saniyede mail gönderimi
        </p>
      </div>

      {/* Test Controls */}
      <div className="marble-card" style={{
        background: 'var(--gradient-marble-subtle)',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: 'var(--shadow-marble-medium)',
        border: '1px solid var(--border-light)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '2rem'
        }}>
          Test Kontrolü
        </h2>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Test URL:
          </label>
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://www.hepsiburada.com/urun-linki"
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '16px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={startTest}
            disabled={isRunning || loading}
            className="btn-modern"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: isRunning ? 'var(--text-muted)' : 'var(--success)',
              color: '#000000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            <Play size={20} />
            {loading ? 'Başlatılıyor...' : 'Test Başlat'}
          </button>

          <button
            onClick={stopTest}
            disabled={!isRunning || loading}
            className="btn-modern"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: !isRunning ? 'var(--text-muted)' : 'var(--error)',
              color: '#000000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: !isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            <Square size={20} />
            {loading ? 'Durduruluyor...' : 'Test Durdur'}
          </button>

          <button
            onClick={refreshLogs}
            className="btn-modern"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--info)',
              color: '#000000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={20} />
            Logları Yenile
          </button>
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className="marble-card" style={{
          background: 'var(--gradient-marble-elegant)',
          borderRadius: '2rem',
          padding: '3rem',
          boxShadow: 'var(--shadow-marble-medium)',
          border: '1px solid var(--border-light)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '2rem'
          }}>
            Test Durumu
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: status.isRunning ? 'var(--success)' : 'var(--error)' }}>
                {status.isRunning ? '🟢' : '🔴'}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                {status.isRunning ? 'Çalışıyor' : 'Durdu'}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {status.runCount}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                Cron Çalışması
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {status.mailCount}
              </div>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                Mail Gönderimi
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {status.uptime}s
              </div>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
                Çalışma Süresi
              </p>
            </div>
          </div>

          {status.testUrl && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <strong>Test URL:</strong> {status.testUrl}
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      <div className="marble-card" style={{
        background: 'var(--gradient-marble-soft)',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: 'var(--shadow-marble-medium)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <FileText size={24} style={{ color: 'var(--text-primary)' }} />
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Test Logları
          </h2>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          maxHeight: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {status?.logs && status.logs.length > 0 ? (
            status.logs.map((log: string, index: number) => (
              <div key={index} style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              Henüz log kaydı yok. Test başlatın veya logları yenileyin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
