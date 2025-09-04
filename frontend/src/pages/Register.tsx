import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Advanced client-side validation
    if (!formData.name.trim()) {
      setError('👤 Ad soyad gereklidir');
      return;
    }
    
    if (formData.name.trim().length < 2) {
      setError('👤 Ad soyad en az 2 karakter olmalıdır');
      return;
    }
    
    if (formData.name.trim().length > 50) {
      setError('👤 Ad soyad 50 karakterden uzun olamaz');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('📧 E-posta adresi gereklidir');
      return;
    }
    
    const emailRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('📧 Geçerli bir e-posta adresi girin (örn: emir@gmail.com)');
      return;
    }
    
    if (formData.email.length > 100) {
      setError('📧 E-posta adresi çok uzun');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('🔒 Şifre gereklidir');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('🔒 Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    if (formData.password.length > 128) {
      setError('🔒 Şifre çok uzun (max 128 karakter)');
      return;
    }
    
    // Password strength check
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    
    if (formData.password.length >= 8 && (!hasUpperCase || !hasLowerCase || !hasNumbers)) {
      setError('🔐 Güçlü şifre için büyük harf, küçük harf ve rakam kullanın');
      return;
    }
    
    if (!formData.confirmPassword.trim()) {
      setError('🔑 Şifre tekrarı gereklidir');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('🔑 Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
    } catch (err: any) {
      console.error('Register error:', err);
      
      // Modern error handling with specific messages
      if (err.message.includes('409') || err.message.includes('zaten kayıtlı')) {
        setError('📧 Bu e-posta adresi zaten kullanımda. Farklı bir e-posta deneyin veya giriş yapın.');
      } else if (err.message.includes('400')) {
        setError('⚠️ Eksik veya geçersiz bilgi. Tüm alanları doğru doldurun.');
      } else if (err.message.includes('500')) {
        setError('🚨 Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (err.message.includes('Network Error') || err.message.includes('ERR_NETWORK')) {
        setError('🌐 İnternet bağlantısı hatası. Bağlantınızı kontrol edin.');
      } else if (err.message.includes('timeout')) {
        setError('⏱️ İstek zaman aşımına uğradı. Tekrar deneyin.');
      } else {
        setError('❌ ' + (err.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-background page-transition">
      <div className="glass-card">
        <div className="auth-logo">
          <h1>Price Agent</h1>
          <p className="auth-subtitle">Hesap oluşturun ve başlayın</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert-modern alert-danger-modern">
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              className="form-control-modern"
              name="name"
              placeholder="Ad ve soyadınızı girin"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div className="input-icon">👤</div>
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-control-modern"
              name="email"
              placeholder="E-posta adresinizi girin"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="input-icon">📧</div>
          </div>

          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control-modern"
              name="password"
              placeholder="Şifrenizi oluşturun (en az 6 karakter)"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ paddingRight: '90px' }}
            />
            <div className="input-icon">🔒</div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'color 0.3s ease',
                zIndex: 10,
                padding: '5px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="form-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control-modern"
              name="confirmPassword"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{ paddingRight: '90px' }}
            />
            <div className="input-icon">🔑</div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'color 0.3s ease',
                zIndex: 10,
                padding: '5px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            className="btn-modern" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-modern"></span>
                Hesap oluşturuluyor...
              </>
            ) : (
              'Hesap Oluştur'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Zaten hesabınız var mı? <Link to="/login" className="auth-link">Giriş yapın</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;