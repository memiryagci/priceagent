import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Calendar, BarChart3, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

interface Product {
  id: number;
  name: string;
  targetPrice: number;
  currentLowestPrice: number | null;
}

interface PriceHistoryItem {
  day: string;
  minPrice: number;
}

const PriceHistory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [historyData, setHistoryData] = useState<PriceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) {
        setProducts([]);
        setSelectedProduct(null);
        setHistoryData([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/products/list');
        const productList = response.data;
        setProducts(productList);
        
        // İlk ürünü otomatik seç
        if (productList.length > 0) {
          setSelectedProduct(productList[0]);
        } else {
          setSelectedProduct(null);
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Products fetch error:', error);
        setProducts([]);
        setSelectedProduct(null);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedProduct) {
        setHistoryData([]);
        return;
      }

      setHistoryLoading(true);
      try {
        const response = await api.get(`/products/${selectedProduct.id}/history`);
        setHistoryData(response.data.history || []);
      } catch (error) {
        console.error('History fetch error:', error);
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedProduct]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
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
          Fiyat geçmişi yükleniyor...
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
          <TrendingUp size={32} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Fiyat Geçmişi
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: '0.5rem 0 0 0'
            }}>
              Ürünlerin fiyat değişim grafiklerini inceleyin
            </p>
          </div>
        </div>

        {/* Product Selection */}
        {products.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '600'
            }}>
              Ürün Seçin:
            </label>
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === parseInt(e.target.value));
                setSelectedProduct(product || null);
              }}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                minWidth: '300px'
              }}
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - Hedef: {formatPrice(product.targetPrice)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chart Area */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.2rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <BarChart3 size={20} />
            {selectedProduct ? selectedProduct.name : 'Fiyat Grafiği'}
          </h3>

          <div style={{ height: '400px', width: '100%' }}>
            {historyLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'var(--text-secondary)'
              }}>
                Grafik yükleniyor...
              </div>
            ) : historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData.map(item => ({
                  date: formatDate(item.day),
                  price: item.minPrice,
                  target: selectedProduct?.targetPrice || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="var(--success)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--success)', strokeWidth: 2, r: 4 }}
                    name="Fiyat"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="var(--error)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Hedef Fiyat"
                  />
                </LineChart>
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
                  {selectedProduct ? 'Henüz fiyat geçmişi yok' : user ? 'Ürün seçin' : 'Giriş yapın'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>
                  {selectedProduct 
                    ? 'Bu ürün için henüz fiyat verisi toplanmamış' 
                    : user 
                      ? 'Yukarıdan bir ürün seçerek fiyat grafiğini görüntüleyebilirsiniz'
                      : 'Fiyat geçmişini görmek için giriş yapmalısınız'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        {selectedProduct && historyData.length > 0 && (
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Calendar size={20} />
                Son Fiyat Değişiklikleri
              </h3>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {historyData.slice(-10).reverse().map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Calendar size={20} style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                          {selectedProduct.name}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                          {formatDate(item.day)}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ 
                        color: item.minPrice <= selectedProduct.targetPrice ? 'var(--success)' : 'var(--text-primary)', 
                        fontWeight: '600', 
                        margin: '0 0 0.25rem 0' 
                      }}>
                        {formatPrice(item.minPrice)}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        {item.minPrice <= selectedProduct.targetPrice ? 'Hedefe ulaştı!' : 'Hedefin üzerinde'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Products Message */}
        {products.length === 0 && user && (
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
              Henüz ürün eklemediniz
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Fiyat geçmişini görmek için önce ürün eklemelisiniz
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceHistory;