import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { ToastType } from '../contexts/ToastContext'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 400)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  return (
    <div className={`toast ${type} ${isVisible ? 'show' : ''}`}>
      <div className="flex items-center">
        <div className="mr-2 flex-shrink-0">
          {getIcon()}
        </div>
        <span className="flex-1">{message}</span>
        <button
          onClick={handleClose}
          className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Toast