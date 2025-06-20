import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import AuthPage from './pages/AuthPage'
import PhoneAuthPage from './pages/PhoneAuthPage'
import AdminLoginPage from './pages/AdminLoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/phone-auth" element={<PhoneAuthPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App