import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import PhoneAuthPage from './pages/PhoneAuthPage'
import AdminLoginPage from './pages/AdminLoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        {/* Global gradient background */}
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
          {/* Animated grid overlay */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 z-[0] h-screen w-screen bg-purple-950/20 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(147,51,234,0.3),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 [perspective:200px] opacity-30">
              <div className="absolute inset-0 [transform:rotateX(65deg)]">
                <div className="animate-grid [background-image:linear-gradient(to_right,#6366f1_1px,transparent_0),linear-gradient(to_bottom,#6366f1_1px,transparent_0)] [background-repeat:repeat] [background-size:50px_50px] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 to-transparent to-90%" />
            </div>
          </div>

          {/* Main content with relative positioning */}
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App