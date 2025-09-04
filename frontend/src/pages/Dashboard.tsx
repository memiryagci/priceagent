import React, { useState, useEffect, useMemo, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, Package, TrendingUp, Settings as SettingsIcon, User, BarChart3, Activity, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const navigate = useNavigate();


  // Dynamic price data from user's products
  const [priceData, setPriceData] = useState([]);

  const [stats, setStats] = useState({
    totalProducts: 0,
    targetReachedCount: 0,
    totalSavings: 0,
    weeklyPriceChecks: 0
  });

  // Fetch real stats and price data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        // Kullanıcı yoksa verileri sıfırla
        setStats({
          totalProducts: 0,
          targetReachedCount: 0,
          totalSavings: 0,
          weeklyPriceChecks: 0
        });
        setPriceData([]);
        return;
      }
      
      try {
        // Stats ve products'ı paralel çek
        const [statsResponse, productsResponse] = await Promise.all([
          api.get('/products/dashboard-stats'),
          api.get('/products/list')
        ]);
        
        setStats(statsResponse.data);
        
        // Eğer ürün varsa, ilk ürünün fiyat geçmişini göster (demo için)
        if (productsResponse.data && productsResponse.data.length > 0) {
          try {
            const firstProduct = productsResponse.data[0];
            const historyResponse = await api.get(`/products/${firstProduct.id}/history`);
            
            // History verilerini grafik formatına çevir
            const chartData = historyResponse.data.history.map((item: any, index: number) => ({
              date: new Date(item.day).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
              price: item.minPrice,
              target: firstProduct.targetPrice
            }));
            
            setPriceData(chartData);
          } catch (historyError) {
            console.error('History fetch error:', historyError);
            setPriceData([]);
          }
        } else {
          setPriceData([]);
        }
        
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Keep default values if API fails
        setStats({
          totalProducts: 0,
          targetReachedCount: 0,
          totalSavings: 0,
          weeklyPriceChecks: 0
        });
        setPriceData([]);
      }
    };
    fetchDashboardData();
  }, [user]); // user dependency eklendi

  // Memoize quick actions to prevent unnecessary re-renders
  const quickActions = useMemo(() => [
    {
      icon: Plus,
      title: 'Yeni Ürün Ekle',
      description: 'Takip etmek istediğiniz ürünü ekleyin',
      path: '/add-product',
      color: 'var(--accent-primary)'
    },
    {
      icon: Package,
      title: 'Ürünlerim',
      description: 'Takip ettiğiniz ürünleri görüntüleyin',
      path: '/my-products',
      color: 'var(--success)'
    },
    {
      icon: TrendingUp,
      title: 'Fiyat Geçmişi',
      description: 'Fiyat değişim grafiklerini inceleyin',
      path: '/price-history',
      color: 'var(--warning)'
    },
    {
      icon: SettingsIcon,
      title: 'Ayarlar',
      description: 'Hesap ve uygulama ayarlarınızı yönetin',
      path: '/settings',
      color: 'var(--text-secondary)'
    }
  ], []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Header - Roman Marble Card */}
      <div className="marble-card" style={{
        background: 'var(--gradient-marble-soft)',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: 'var(--shadow-marble-medium)',
        border: '1px solid var(--border-light)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            boxShadow: 'var(--shadow-marble-soft)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              margin: 0,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Hoş geldiniz!
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.2rem',
              margin: '0.5rem 0 0 0',
              fontFamily: 'var(--font-primary)',
              fontWeight: '500'
            }}>
              Fiyat takibinizi kolayca yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Roman Marble Card */}
      <div className="marble-card" style={{
        background: 'var(--gradient-marble-subtle)',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: 'var(--shadow-marble-medium)',
        border: '1px solid var(--border-light)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Home size={36} style={{ color: 'var(--text-primary)' }} />
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              margin: 0,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Hızlı İşlemler
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: '0.25rem 0 0 0',
              fontFamily: 'var(--font-primary)',
              fontWeight: '500'
            }}>
              Yapmak istediğiniz işlemi seçin
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="marble-action-card"
                style={{
                  background: 'var(--gradient-marble-elegant)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '1.5rem',
                  padding: '2.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-marble-soft)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-marble-medium)';
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-marble-soft)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '1rem',
                    background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-marble-soft)'
                  }}>
                    <Icon size={28} style={{ color: action.color }} />
                  </div>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '1.3rem', 
                    fontWeight: '700',
                    fontFamily: 'var(--font-display)',
                    margin: 0,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}>
                    {action.title}
                  </h3>
                </div>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: '1.5',
                  fontFamily: 'var(--font-primary)',
                  fontWeight: '500'
                }}>
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px var(--shadow-light)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <BarChart3 size={32} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              📊 Özet
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              margin: '0.25rem 0 0 0'
            }}>
              Fiyat takip aktiviteniz
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem' 
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              opacity: '0.1'
            }}>
              <Package size={24} style={{ color: 'var(--success)', opacity: '1' }} />
            </div>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '2rem', 
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              margin: '0 0 0.5rem 0'
            }}>
              {stats.totalProducts}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
              Takip Edilen Ürün
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              opacity: '0.1'
            }}>
              <TrendingUp size={24} style={{ color: 'var(--warning)', opacity: '1' }} />
            </div>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '2rem', 
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              margin: '0 0 0.5rem 0'
            }}>
              {stats.targetReachedCount}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
              Hedefe Ulaşan
            </p>
          </div>

          <div style={{
            background: 'var(--gradient-marble-elegant)',
            border: '1px solid var(--border-light)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-marble-soft)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-bronze))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-marble-soft)'
            }}>
              <Target size={24} style={{ color: '#000000' }} />
            </div>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '2rem', 
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              margin: '0 0 0.5rem 0'
            }}>
              {stats.totalSavings}₺
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
              Toplam Tasarruf
            </p>
          </div>

          <div style={{
            background: 'var(--gradient-marble-accent)',
            border: '1px solid var(--border-light)',
            borderRadius: '1rem',
            padding: '1.5rem',
            textAlign: 'center',
            animation: 'marbleSlideIn 0.8s ease-out',
            animationDelay: '0.3s',
            animationFillMode: 'both',
            boxShadow: 'var(--shadow-marble-soft)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--info), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-marble-soft)'
            }}>
              <Activity size={24} style={{ color: '#000000' }} />
            </div>
            <h3 style={{ 
              color: 'var(--text-primary)', 
              fontSize: '2rem', 
              fontWeight: '700',
              fontFamily: 'var(--font-display)',
              margin: '0 0 0.5rem 0'
            }}>
              {stats.weeklyPriceChecks}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
              Haftalık Kontrol
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginTop: '2rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.25rem', 
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            🎯 Başlamaya Hazır mısınız?
          </h3>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1rem',
            marginBottom: '1.5rem',
            maxWidth: '600px',
            margin: '0 auto 1.5rem'
          }}>
            İlk ürününüzü ekleyerek fiyat takibine başlayın. Hedef fiyata ulaştığında size haber verelim!
          </p>
          <button
            onClick={() => navigate('/add-product')}
            style={{
              background: 'var(--accent-primary)',
              color: '#000000',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--accent-secondary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={20} />
            İlk Ürününüzü Ekleyin
          </button>
        </div>
      </div>

      {/* Price Chart Section */}
      <div className="marble-card" style={{
        background: 'var(--gradient-marble-soft)',
        borderRadius: '2rem',
        padding: '3rem',
        boxShadow: 'var(--shadow-marble-medium)',
        border: '1px solid var(--border-light)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Activity size={36} style={{ color: 'var(--text-primary)' }} />
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              margin: 0,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Fiyat Takibi
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: '0.25rem 0 0 0',
              fontFamily: 'var(--font-primary)',
              fontWeight: '500'
            }}>
              Son 7 günün fiyat değişim grafiği
            </p>
          </div>
        </div>

        <div style={{ height: '400px', width: '100%' }}>
          {priceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
              <defs>
                <linearGradient id="hepsiburada" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="n11" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="target" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                fontSize={12}
                fontFamily="var(--font-primary)"
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={12}
                fontFamily="var(--font-primary)"
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--marble-pure)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-marble-medium)',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '14px'
                }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: '600' }}
              />
              <Area 
                type="monotone" 
                dataKey="hepsiburada" 
                stroke="var(--success)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#hepsiburada)" 
                name="Hepsiburada"
              />
              <Area 
                type="monotone" 
                dataKey="n11" 
                stroke="var(--warning)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#n11)" 
                name="N11"
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="var(--accent-gold)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#target)" 
                name="Hedef Fiyat"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)'
            }}>
              <BarChart3 size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                {user ? 'Henüz fiyat verisi yok' : 'Giriş yapın'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>
                {user ? 'Ürün ekleyip fiyat takibi başlattığınızda grafik burada görünecek' : 'Fiyat grafiklerini görmek için giriş yapmalısınız'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Dashboard);