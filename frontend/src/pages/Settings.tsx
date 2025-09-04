import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Mail, Check, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      showError('Hata', 'E-posta adresi boş olamaz');
      return;
    }

    const emailRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      showError('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    if (newEmail === user?.email) {
      showError('Hata', 'Yeni e-posta mevcut e-posta ile aynı');
      return;
    }

    setIsChangingEmail(true);
    try {
      console.log('E-posta değiştirme isteği gönderiliyor:', { email: newEmail });
      const response = await api.put('/auth/change-email', { email: newEmail });
      console.log('E-posta değiştirme başarılı:', response.data);
      showSuccess('Başarılı', 'E-posta başarıyla değiştirildi!');
      setShowEmailChange(false);
      setNewEmail('');
      
      // Kullanıcı bilgilerini güncellemek için sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('E-posta değiştirme hatası:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'E-posta değiştirme başarısız';
      showError('Hata', errorMessage);
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px var(--shadow-light)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <SettingsIcon size={32} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Ayarlar
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: '0.5rem 0 0 0'
            }}>
              Uygulama tercihlerinizi yönetin
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Palette size={24} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              Görünüm
            </h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                Koyu Tema
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                {isDark ? 'Koyu tema aktif' : 'Açık tema aktif'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                background: isDark ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '1.5rem',
                width: '60px',
                height: '32px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: isDark ? '31px' : '3px',
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Bell size={24} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              Bildirimler
            </h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                  Fiyat Düşüşü Bildirimleri
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Hedef fiyata ulaşıldığında bildirim al
                </p>
              </div>
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '1.5rem',
                width: '60px',
                height: '32px',
                position: 'relative',
                opacity: '0.5'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: '3px',
                  width: '24px',
                  height: '24px',
                  background: 'var(--text-muted)',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                  Günlük Rapor
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Günlük fiyat değişiklik özeti
                </p>
              </div>
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '1.5rem',
                width: '60px',
                height: '32px',
                position: 'relative',
                opacity: '0.5'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: '3px',
                  width: '24px',
                  height: '24px',
                  background: 'var(--text-muted)',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Shield size={24} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
              Hesap
            </h3>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <button style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              padding: '0.875rem 1rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}>
              Şifre Değiştir
            </button>
            
            <div>
              <button 
                onClick={() => setShowEmailChange(!showEmailChange)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '0.875rem 1rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  fontSize: '0.95rem',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Mail size={16} />
                E-posta Değiştir
                {user?.email && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {user.email}
                  </span>
                )}
              </button>

              {showEmailChange && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      Yeni E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="yeni@email.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleEmailChange}
                      disabled={isChangingEmail || !newEmail.trim()}
                      style={{
                        background: 'var(--accent-primary)',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        cursor: isChangingEmail ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: isChangingEmail || !newEmail.trim() ? 0.6 : 1
                      }}
                    >
                      <Check size={14} />
                      {isChangingEmail ? 'Değiştiriliyor...' : 'Onayla'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowEmailChange(false);
                        setNewEmail('');
                      }}
                      style={{
                        background: 'var(--bg-primary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <X size={14} />
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem',
          padding: '1rem',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: 0 }}>
            🏺 PriceAgent v1.0.0 - Fiyat takip sistemi
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
