import { motion } from 'framer-motion'

export default function ThemeButton({ 
  children, 
  onClick, 
  icon, 
  variant = 'primary',
  className = ''
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold shadow-lg transition-colors ${
        variant === 'primary'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200'
      } ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </motion.button>
  )
}