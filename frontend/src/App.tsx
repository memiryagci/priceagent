import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const MyProducts = lazy(() => import('./pages/MyProducts'));
const PriceHistory = lazy(() => import('./pages/PriceHistory'));
const Settings = lazy(() => import('./pages/Settings'));
const TestPage = lazy(() => import('./pages/TestPage'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

// Loading Component
const LoadingScreen = () => (
  <div className="auth-background" style={{ minHeight: '100vh' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner-modern"></div>
        <p style={{ 
          color: '#cbd5e1', 
          marginTop: '16px', 
          fontSize: '16px',
          margin: '16px 0 0 0'
        }}>
          Yükleniyor...
        </p>
      </div>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// Home Redirect Component
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/register" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingScreen />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingScreen />}>
              <Register />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
              <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <AddProduct />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-products"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <MyProducts />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-history"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <PriceHistory />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <Settings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <TestPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <AdminUsers />
              </Suspense>
            </ProtectedRoute>
          }
        />
      <Route path="/" element={<HomeRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;