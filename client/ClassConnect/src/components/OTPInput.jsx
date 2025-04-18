import { useState, useRef } from 'react'

export default function OTPInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const inputs = useRef([])

  const handleChange = (e, index) => {
    const value = e.target.value
    if (isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < length - 1) {
      inputs.current[index + 1].focus()
    }
    
    // Trigger completion
    if (newOtp.every(num => num !== '')) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus()
    }
  }

  return (
    <div className="flex justify-center gap-1 sm:gap-2 mb-6 px-2 w-full">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          ref={(el) => (inputs.current[index] = el)}
          className="flex-1 max-w-[14%] min-w-[40px] h-12 sm:h-14 text-xl sm:text-2xl text-center border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-colors"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}