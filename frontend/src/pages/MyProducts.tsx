import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, TrendingUp, TrendingDown, Minus, ExternalLink, Trash2 } from 'lucide-react';
import api from '../services/api';

interface Product {
  id: number;
  userId: number;
  name: string;
  url: string;
  targetPrice: number;
  currentLowestPrice: number | null;
  lowestSite: string | null;
  lowestPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/products/list');
        setProducts(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Products fetch error:', err);
        setError('Ürünler yüklenirken hata oluştu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const deleteProduct = async (productId: number) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      await api.delete(`/products/delete/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Bilinmiyor';
    return `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
  };

  const getPriceChangeIcon = (current: number | null, target: number) => {
    if (!current) return <Minus size={16} style={{ color: 'var(--text-muted)' }} />;
    if (current <= target) return <TrendingDown size={16} style={{ color: 'var(--success)' }} />;
    return <TrendingUp size={16} style={{ color: 'var(--error)' }} />;
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Ürünler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px var(--shadow-light)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Package size={32} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Ürünlerim
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: '0.5rem 0 0 0'
            }}>
              Takip ettiğiniz ürünlerin fiyat bilgileri
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--error)',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Dynamic Product Cards */}
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    lineHeight: '1.4',
                    margin: 0,
                    flex: 1,
                    marginRight: '1rem'
                  }}>
                    {product.name}
                  </h3>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                    title="Ürünü Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>
                      Mevcut En Düşük Fiyat
                    </p>
                    <p style={{ 
                      color: product.currentLowestPrice && product.currentLowestPrice <= product.targetPrice ? 'var(--success)' : 'var(--text-primary)', 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      margin: 0 
                    }}>
                      {formatPrice(product.currentLowestPrice)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>
                      Hedef Fiyat
                    </p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                      {formatPrice(product.targetPrice)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <div style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {getPriceChangeIcon(product.currentLowestPrice, product.targetPrice)}
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {product.currentLowestPrice && product.currentLowestPrice <= product.targetPrice 
                        ? 'Hedefe ulaştı!' 
                        : 'Hedefin üzerinde'}
                    </span>
                  </div>
                  
                  {product.lowestSite && (
                    <div style={{
                      background: 'var(--info)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {product.lowestSite}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => window.location.href = `/price-history`}
                    style={{
                      flex: 1,
                      background: 'var(--accent-primary)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Fiyat Geçmişi
                  </button>
                  <button 
                    onClick={() => window.open(product.url, '_blank')}
                    style={{
                      background: 'var(--bg-primary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    title="Ürünü Görüntüle"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              background: 'var(--bg-secondary)',
              border: '2px dashed var(--border-color)',
              borderRadius: '0.75rem',
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                {user ? 'Henüz ürün eklemediniz' : 'Giriş yapın'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                {user ? 'Yeni ürün eklemek için "Ürün Ekle" sayfasını kullanın' : 'Ürünlerinizi görmek için giriş yapmalısınız'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProducts;