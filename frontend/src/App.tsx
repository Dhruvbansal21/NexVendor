import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { RoleRoute } from './components/guards/RoleRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { VendorOnboardingPage } from './pages/vendor/VendorOnboardingPage';
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorProductsPage } from './pages/vendor/VendorProductsPage';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminVendorsPage } from './pages/admin/AdminVendorsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-sand-50 text-stone-900">
        <Navbar />
        <ToastContainer />

        <div className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Routes */}
            <Route
              path="/checkout"
              element={
                <RoleRoute allowedRoles={['customer']}>
                  <CheckoutPage />
                </RoleRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <RoleRoute allowedRoles={['customer']}>
                  <MyOrdersPage />
                </RoleRoute>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor/onboarding"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorOnboardingPage />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/dashboard"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/products"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorProductsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/vendor/orders"
              element={
                <RoleRoute allowedRoles={['vendor']}>
                  <VendorOrdersPage />
                </RoleRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminVendorsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminOrdersPage />
                </RoleRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
