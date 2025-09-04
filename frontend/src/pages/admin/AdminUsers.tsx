import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Edit, Trash2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface UserData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Admin kontrolü
  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Yetkisiz Erişim</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Admin users fetch başlıyor...');
      const response = await api.get('/admin/users');
      console.log('Admin users response:', response.data);
      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Users fetch error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Kullanıcılar yüklenirken hata oluştu';
      showError('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetail = async (user: UserData) => {
    try {
      const response = await api.get(`/admin/users/${user.id}`);
      setSelectedUser(response.data.user);
      setShowUserDetail(true);
    } catch (error: any) {
      showError('Hata', 'Kullanıcı detayları yüklenirken hata oluştu');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Bu kullanıcıyı ve tüm verilerini silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      showSuccess('Başarılı', 'Kullanıcı başarıyla silindi');
      fetchUsers();
      if (selectedUser?.id === userId) {
        setShowUserDetail(false);
        setSelectedUser(null);
      }
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="marble-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Users size={32} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              margin: 0
            }}>
              Kullanıcı Yönetimi
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.1rem',
              margin: '0.5rem 0 0 0'
            }}>
              Tüm kullanıcıları görüntüle ve yönet
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }} />
            <input
              type="text"
              placeholder="ID, isim veya e-posta ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Kullanıcılar yükleniyor...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredUsers.map((user) => (
              <div key={user.id} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000000',
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.1rem' }}>
                      {user.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                      {user.email} • ID: {user.id}
                    </p>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                      Kayıt: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => viewUserDetail(user)}
                    style={{
                      background: 'var(--accent-primary)',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Eye size={16} />
                    Detay
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            {searchTerm ? 'Arama kriterinize uygun kullanıcı bulunamadı.' : 'Henüz kullanıcı bulunmamaktadır.'}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <User size={24} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>
                Kullanıcı Detayları
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID</label>
                <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                  {selectedUser.id}
                </p>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>İsim</label>
                <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                  {selectedUser.name}
                </p>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>E-posta</label>
                <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Kayıt Tarihi</label>
                <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                  {new Date(selectedUser.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Son Güncelleme</label>
                <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                  {new Date(selectedUser.updatedAt).toLocaleString('tr-TR')}
                </p>
              </div>
              {selectedUser.productCount !== undefined && (
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Takip Edilen Ürün Sayısı</label>
                  <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>
                    {selectedUser.productCount} ürün
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUserDetail(false)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer'
                }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
