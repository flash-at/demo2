import React from 'react'

interface PasswordStrengthIndicatorProps {
  password: string
}

interface PasswordChecks {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  number: boolean
  special: boolean
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const checkPasswordStrength = (password: string) => {
    const checks: PasswordChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    const score = Object.values(checks).filter(Boolean).length
    
    let strength = 'Very Weak'
    let color = 'text-red-400'
    
    if (score >= 4) {
      strength = 'Strong'
      color = 'text-green-400'
    } else if (score >= 3) {
      strength = 'Good'
      color = 'text-yellow-400'
    } else if (score >= 2) {
      strength = 'Fair'
      color = 'text-orange-400'
    }

    return { strength, color, score, checks }
  }

  if (!password) return null

  const result = checkPasswordStrength(password)

  const requirements = [
    { met: result.checks.length, text: 'At least 8 characters' },
    { met: result.checks.uppercase, text: 'One uppercase letter' },
    { met: result.checks.lowercase, text: 'One lowercase letter' },
    { met: result.checks.number, text: 'One number' },
    { met: result.checks.special, text: 'One special character' }
  ]

  return (
    <div className="mt-2 text-xs text-slate-400">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs">Strength:</span>
        <span className={`text-xs font-medium ${result.color}`}>{result.strength}</span>
        <div className="flex-1 bg-slate-600 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              result.score >= 4 ? 'bg-green-400' : 
              result.score >= 3 ? 'bg-yellow-400' : 
              result.score >= 2 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${(result.score / 5) * 100}%` }}
          />
        </div>
      </div>
      <div className="text-xs leading-relaxed">
        {requirements.map((req, index) => (
          <div key={index} className={req.met ? 'text-green-400' : 'text-slate-500'}>
            {req.met ? '✓' : '○'} {req.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PasswordStrengthIndicator