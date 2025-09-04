import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Home, 
  Plus, 
  Package, 
  TrendingUp, 
  Settings, 
  LogOut,
  X,
  Menu,
  Moon,
  Sun,
  TestTube,
  Users,
  Shield
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', path: '/dashboard' },
    { icon: Plus, label: 'Ürün Ekle', path: '/add-product' },
    { icon: Package, label: 'Ürünlerim', path: '/my-products' },
    { icon: TrendingUp, label: 'Fiyat Geçmişi', path: '/price-history' },
    ...(isAdmin ? [
      { icon: Shield, label: 'Admin Panel', path: '/admin', isSection: true },
      { icon: Users, label: 'Kullanıcı Yönetimi', path: '/admin/users' },
      { icon: TestTube, label: 'Cron Test', path: '/test' },
    ] : []),
    { icon: Settings, label: 'Ayarlar', path: '/settings' },
    { icon: LogOut, label: 'Çıkış Yap', path: '/logout', isLogout: true },
  ];

  const handleNavigation = (path: string, isLogout?: boolean) => {
    if (isLogout) {
      handleLogout();
    } else {
      navigate(path);
      if (window.innerWidth < 1024) {
        onToggle(); // Mobilde menüyü kapat
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Roman Marble Sidebar */}
      <div className={`sidebar marble-sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2>PriceAgent</h2>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={onToggle}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path && !item.isLogout;
            
            if (item.isSection) {
              return (
                <div key={item.path} style={{
                  padding: '0.75rem 1rem',
                  marginTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
              );
            }
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path, item.isLogout)}
                className={`nav-item ${isActive ? 'nav-item-active' : ''} ${item.isLogout ? 'nav-item-logout' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="sidebar-theme">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Açık Tema' : 'Koyu Tema'}</span>
          </button>
        </div>
      </div>

      {/* Roman Style Menu Toggle Button */}
      <button 
        className={`sidebar-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={onToggle}
      >
        <div className="menu-line"></div>
        <div className="menu-line"></div>
        <div className="menu-line"></div>
      </button>
    </>
  );
};

export default Sidebar;
