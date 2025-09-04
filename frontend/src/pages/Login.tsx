import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.email.trim()) {
      setError('⚠️ E-posta adresi gereklidir');
      return;
    }
    
    const emailRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('⚠️ Geçerli bir e-posta adresi girin');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('⚠️ Şifre gereklidir');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('⚠️ Şifre en az 6 karakter olmalıdır');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Modern error handling
      if (err.message.includes('401') || err.message.includes('Geçersiz')) {
        setError('🔒 Hatalı e-posta veya şifre. Lütfen tekrar deneyin.');
      } else if (err.message.includes('400')) {
        setError('⚠️ Eksik bilgi. Tüm alanları doldurun.');
      } else if (err.message.includes('500')) {
        setError('🚨 Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (err.message.includes('Network Error') || err.message.includes('ERR_NETWORK')) {
        setError('🌐 İnternet bağlantısı hatası. Bağlantınızı kontrol edin.');
      } else {
        setError('❌ ' + (err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'));
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
          <p className="auth-subtitle">Hoş geldiniz! Giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert-modern alert-danger-modern">
              {error}
            </div>
          )}

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
              placeholder="Şifrenizi girin"
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

          <button 
            className="btn-modern" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-modern"></span>
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          Hesabınız yok mu? <Link to="/register" className="auth-link">Kayıt olun</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;