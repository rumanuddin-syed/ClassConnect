import { motion } from 'framer-motion'
import { FaPlus, FaSearch } from 'react-icons/fa'
import ThemeButton from '../shared/ThemeButton'

export default function DashboardActions({ onCreate, onJoin }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between  gap-4 mb-8">
      <ThemeButton
        onClick={onCreate}
        icon={<FaPlus />}
        variant="primary"
      >
        Create Class
      </ThemeButton>

      <ThemeButton
        onClick={onJoin}
        icon={<FaSearch />}
        variant="secondary"
      >
        Join Class
      </ThemeButton>
    </div>
  )
}