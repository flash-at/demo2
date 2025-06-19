import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { ArrowLeft, Phone } from 'lucide-react'
import { auth } from '../config/firebase'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'

const PhoneAuthPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [status, setStatus] = useState({ message: 'Initializing...', type: 'warning' })

  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    initializeRecaptcha()
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear()
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCountdown])

  const initializeRecaptcha = () => {
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          setStatus({ message: 'reCAPTCHA verified - ready to send OTP', type: 'success' })
        },
        'expired-callback': () => {
          setStatus({ message: 'reCAPTCHA expired - please verify again', type: 'warning' })
          showToast('reCAPTCHA expired. Please verify again.', 'warning')
        }
      })

      verifier.render().then(() => {
        setRecaptchaVerifier(verifier)
        setStatus({ message: 'Please complete the reCAPTCHA verification', type: 'warning' })
      }).catch(error => {
        console.error('reCAPTCHA render error:', error)
        setStatus({ message: 'reCAPTCHA failed to load', type: 'error' })
        showToast('reCAPTCHA setup failed. Please refresh the page.', 'error')
      })
    } catch (error) {
      console.error('reCAPTCHA initialization error:', error)
      setStatus({ message: 'reCAPTCHA setup failed', type: 'error' })
      showToast('reCAPTCHA initialization failed.', 'error')
    }
  }

  const validatePhoneNumber = (phone: string) => {
    return /^[6-9]\d{9}$/.test(phone)
  }

  const handleSendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      showToast('Please enter a valid 10-digit Indian mobile number starting with 6-9.', 'error')
      return
    }

    if (!recaptchaVerifier) {
      showToast('reCAPTCHA not ready. Please refresh the page.', 'error')
      return
    }

    const fullPhoneNumber = `+91${phoneNumber}`
    setIsLoading(true)
    setStatus({ message: 'Sending OTP...', type: 'warning' })

    try {
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier)
      setConfirmationResult(result)
      setIsOtpSent(true)
      setResendCountdown(60)
      setStatus({ message: 'OTP sent successfully', type: 'success' })
      showToast('OTP sent successfully! Check your phone.', 'success')
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      setStatus({ message: 'Failed to send OTP', type: 'error' })
      
      const errorMessages: Record<string, string> = {
        'auth/invalid-phone-number': 'Invalid phone number format.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
        'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please try again.',
        'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.'
      }
      
      const message = errorMessages[error.code] || `Error sending OTP: ${error.message}`
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      showToast('Please enter the complete 6-digit OTP.', 'error')
      return
    }

    if (!confirmationResult) {
      showToast('Please request an OTP first.', 'error')
      return
    }

    setIsLoading(true)
    setStatus({ message: 'Verifying OTP...', type: 'warning' })

    try {
      await confirmationResult.confirm(otp)
      setStatus({ message: 'Authentication successful', type: 'success' })
      showToast('Phone authentication successful! Welcome.', 'success')
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      setStatus({ message: 'OTP verification failed', type: 'error' })
      
      const errorMessages: Record<string, string> = {
        'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
        'auth/code-expired': 'OTP has expired. Please request a new one.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
      }
      
      const message = errorMessages[error.code] || 'OTP verification failed. Please try again.'
      showToast(message, 'error')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = () => {
    if (resendCountdown > 0) {
      showToast(`Please wait ${resendCountdown} seconds before resending.`, 'warning')
      return
    }

    setIsOtpSent(false)
    setConfirmationResult(null)
    setOtp('')
    initializeRecaptcha()
    showToast('Please complete reCAPTCHA verification again to resend OTP.', 'info')
    setStatus({ message: 'Please complete reCAPTCHA to resend OTP', type: 'warning' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Phone Authentication
          </h1>
          <p className="text-slate-400 mt-2">Sign in with your phone number</p>
        </header>

        {/* Main Container */}
        <main className="bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          {/* Status Display */}
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${
            status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
            status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          }`}>
            <div className="w-4 h-4">
              {status.type === 'success' && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status.type === 'error' && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {status.type === 'warning' && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium">{status.message}</span>
          </div>

          <div className="space-y-6">
            {/* Phone Number Input */}
            {!isOtpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <div className="flex rounded-xl shadow-sm">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-600 bg-slate-700/50 text-slate-300 text-sm font-medium">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="input-field flex-1 block w-full min-w-0 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-none rounded-r-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Enter your 10-digit Indian mobile number</p>
                </div>

                {/* reCAPTCHA Container */}
                <div id="recaptcha-container" className="flex justify-center items-center min-h-[78px] rounded-xl bg-slate-700/30 border border-slate-600/50" />

                {/* Send OTP Button */}
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading || !phoneNumber || !validatePhoneNumber(phoneNumber)}
                  className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Sending...
                    </div>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </>
            )}

            {/* OTP Input */}
            {isOtpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="input-field block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm placeholder-slate-400 text-slate-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-center text-lg tracking-widest"
                  />
                  <p className="mt-2 text-xs text-slate-400 text-center">
                    Enter the 6-digit code sent to +91{phoneNumber}
                  </p>
                </div>

                {/* Verify OTP Button */}
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || !otp || otp.length !== 6}
                  className="btn-primary w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-slate-400">Didn't receive the code?</p>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0}
                    className="mt-2 text-sm text-orange-400 hover:text-orange-300 transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}

            {/* Back Button */}
            <button
              onClick={() => navigate('/auth')}
              className="btn-secondary w-full flex justify-center items-center py-3 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-medium text-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login Options
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} CodeCafe. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default PhoneAuthPage