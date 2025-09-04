import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingCart, Tag, Link, Store, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface PriceResult {
  url: string;
  site: string;
  price: number | null;
  success: boolean;
  error?: string;
  loading: boolean;
}

interface ProductData {
  name: string;
  targetPrice: number;
  urls: string[];
  prices: { site: string; price: number }[];
}

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [hepsiburadaUrl, setHepsiburadaUrl] = useState('');
  const [n11Url, setN11Url] = useState('');
  const [priceResults, setPriceResults] = useState<PriceResult[]>([]);
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatPriceTR = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isSupportedSite = (url: string): boolean => {
    return url.includes('hepsiburada.com') || url.includes('n11.com');
  };

  const scrapePrice = async (url: string, siteKey: string): Promise<PriceResult> => {
    const result: PriceResult = {
      url,
      site: siteKey === 'hepsiburada' ? 'hepsiburada' : 'n11',
      price: null,
      success: false,
      loading: true
    };

    try {
      const response = await api.post('/products/scrape-price', { url });
      result.price = response.data.price;
      result.success = true;
    } catch (error: any) {
      console.error('Scrape error:', error);
      result.error = error.response?.data?.message || 'Fiyat çekilemedi - lütfen tekrar deneyin';
      result.success = false;
    }

    result.loading = false;
    return result;
  };

  const handleScrapePrices = async () => {
    const urls = [
      { url: hepsiburadaUrl, key: 'hepsiburada' },
      { url: n11Url, key: 'n11' }
    ].filter(item => item.url.trim() !== '');

    if (urls.length === 0) {
      setGeneralError('En az bir URL girmelisiniz');
      return;
    }

    for (const { url, key } of urls) {
      if (!validateUrl(url)) {
        setGeneralError(`Geçersiz URL formatı: ${url}`);
        return;
      }
      if (!isSupportedSite(url)) {
        setGeneralError(`Desteklenmeyen site: ${url}`);
        return;
      }
    }

    setLoadingScrape(true);
    setGeneralError(null);
    setSuccessMessage(null);

    const initialResults: PriceResult[] = urls.map(({ url, key }) => ({
      url,
      site: key === 'hepsiburada' ? 'hepsiburada' : 'n11',
      price: null,
      success: false,
      loading: true
    }));

    setPriceResults(initialResults);

    const results = await Promise.all(
      urls.map(({ url, key }) => scrapePrice(url, key))
    );

    setPriceResults(results);
    setLoadingScrape(false);
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !targetPrice.trim()) {
      setGeneralError('Ürün adı ve hedef fiyat gereklidir');
      return;
    }

    const successfulResults = priceResults.filter(r => r.success);
    if (successfulResults.length === 0) {
      setGeneralError('Önce fiyatları çekin ve en az bir başarılı sonuç alın');
      return;
    }

    setLoadingSave(true);
    setGeneralError(null);

    try {
      const response = await api.post('/products/add', {
        name: productName,
        targetPrice: parseFloat(targetPrice),
        urls: successfulResults.map(r => r.url),
        prices: successfulResults.map(r => ({ site: r.site, price: r.price }))
      });

      setSuccessMessage('Ürün başarıyla kaydedildi ve fiyat takibine alındı!');
      setTimeout(() => {
        navigate('/my-products');
      }, 2000);
    } catch (error: any) {
      console.error('Product save error:', error);
      setGeneralError(error.response?.data?.message || 'Ürün kaydedilemedi - lütfen tekrar deneyin');
    }

    setLoadingSave(false);
  };

  const getMinPrice = (): number | null => {
    const validPrices = priceResults.filter(r => r.success && r.price !== null).map(r => r.price!);
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

  const getMaxPrice = (): number | null => {
    const validPrices = priceResults.filter(r => r.success && r.price !== null).map(r => r.price!);
    return validPrices.length > 0 ? Math.max(...validPrices) : null;
  };

  const getPriceDifference = (): number | null => {
    const minPrice = getMinPrice();
    const maxPrice = getMaxPrice();
    return minPrice && maxPrice ? maxPrice - minPrice : null;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px var(--shadow-light)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <ShoppingCart size={32} style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '2rem', 
            fontWeight: '700',
            margin: 0
          }}>
            Yeni Ürün Ekle
          </h1>
        </div>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem', 
          margin: 0
        }}>
          Takip etmek istediğiniz ürünün bilgilerini girin ve fiyatları karşılaştırın
        </p>
      </div>

      {/* Product Form */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 20px var(--shadow-light)',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* URL girişleri ve fiyat çekme önce gelsin */}

          {/* URLs */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                <Store size={18} />
                Hepsiburada URL
              </label>
              <input
                type="url"
                value={hepsiburadaUrl}
                onChange={(e) => setHepsiburadaUrl(e.target.value)}
                placeholder="https://www.hepsiburada.com/..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                <Store size={18} />
                N11 URL
              </label>
              <input
                type="url"
                value={n11Url}
                onChange={(e) => setN11Url(e.target.value)}
                placeholder="https://www.n11.com/..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Scrape Button */}
          <button
            onClick={handleScrapePrices}
            disabled={loadingScrape || (!hepsiburadaUrl.trim() && !n11Url.trim())}
            style={{
              background: loadingScrape ? 'var(--text-muted)' : 'var(--accent-primary)',
              color: '#000000',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loadingScrape ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              marginTop: '0.5rem'
            }}
          >
            {loadingScrape ? <Loader2 size={20} className="animate-spin" /> : <Link size={20} />}
            {loadingScrape ? 'Fiyatlar Çekiliyor...' : 'Fiyatları Çek'}
          </button>
        </div>
      </div>

      {/* Price Results */}
      {priceResults.length > 0 && (
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 20px var(--shadow-light)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <TrendingUp size={24} />
            Fiyat Sonuçları
          </h3>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {priceResults.map((result, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${result.success ? 'var(--success)' : result.error ? 'var(--error)' : 'var(--border-color)'}`,
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  {result.loading ? (
                    <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                  ) : result.success ? (
                    <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                  ) : (
                    <XCircle size={20} style={{ color: 'var(--error)' }} />
                  )}
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    margin: 0,
                    textTransform: 'capitalize'
                  }}>
                    {result.site}
                  </h4>
                </div>

                {result.loading ? (
                  <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Fiyat çekiliyor...</p>
                ) : result.success ? (
                  <div>
                    <p style={{ 
                      color: 'var(--success)', 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      margin: '0 0 0.5rem 0' 
                    }}>
                      {formatPriceTR(result.price ?? null)} TL
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                      Fiyat başarıyla çekildi
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--error)', fontWeight: '500', margin: '0 0 0.5rem 0' }}>
                      Hata
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Price Comparison */}
          {priceResults.some(r => r.success) && (
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginTop: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
                📊 Fiyat Karşılaştırması
              </h4>
              
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>
                    En Düşük Fiyat
                  </p>
                  <p style={{ color: 'var(--success)', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                    {formatPriceTR(getMinPrice())} TL
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>
                    En Yüksek Fiyat
                  </p>
                  <p style={{ color: 'var(--error)', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                    {formatPriceTR(getMaxPrice())} TL
                  </p>
                </div>
                
                {getPriceDifference() && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>
                      Fark
                    </p>
                    <p style={{ color: 'var(--warning)', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                      {formatPriceTR(getPriceDifference())} TL
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fiyatlar çekildikten sonra ürün etiketi ve hedef fiyat sorulsun */}
      {priceResults.some(r => r.success) && (
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 20px var(--shadow-light)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Product Name */}
            <div>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                <Tag size={18} />
                Ürün Adı
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Örn: ASUS TUF Gaming M3 Gen II Mouse"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>

            {/* Target Price */}
            <div>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                <TrendingDown size={18} />
                Hedef Fiyat (TL)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="800"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {(generalError || successMessage) && (
        <div style={{
          background: generalError ? 'var(--error)' : 'var(--success)',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {generalError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {generalError || successMessage}
        </div>
      )}

      {/* Save Button */}
      {priceResults.some(r => r.success) && (
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 20px var(--shadow-light)',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <button
            onClick={handleSaveProduct}
            disabled={loadingSave}
            style={{
              background: loadingSave ? 'var(--text-muted)' : 'var(--success)',
              color: '#000000',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '1rem 3rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loadingSave ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              transition: 'all 0.2s ease'
            }}
          >
            {loadingSave ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
            {loadingSave ? 'Kaydediliyor...' : 'Ürünü Kaydet ve Takibe Al'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddProduct;