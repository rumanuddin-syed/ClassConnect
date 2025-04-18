import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function AuthHeader({ title, showBack = false }) {
  return (
    <header className="w-full py-4 bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl px-4">
      <div className="max-w-6xl mx-auto flex items-center">
        {showBack && (
          <Link to="/login" className="mr-4 text-white hover:text-blue-200">
            <FaArrowLeft className="text-lg" />
          </Link>
        )}
        <h1 className="text-2xl font-black text-white tracking-tight">ClassConnect</h1>
        <div className="ml-auto">
          <span className="text-white text-sm">{title}</span>
        </div>
      </div>
    </header>
  )
}