import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { requestJoinClass } from '../../redux/slices/classSlice'

const JoinClassForm = ({ onClose }) => {
  const dispatch = useDispatch()
  const { actionStatus } = useSelector((state) => state.classes)
  const [formData, setFormData] = useState({
    classCode: '',
    role: 'student'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(requestJoinClass({classId:formData.classCode,role:formData.role})).unwrap()
      onClose()
    } catch (error) {
      console.error("Failed to join class:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Join Class</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={actionStatus === 'loading'}
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Code*</label>
            <input
              type="text"
              required
              value={formData.classCode}
              onChange={(e) => setFormData({...formData, classCode: e.target.value})}
              className="w-full p-2 border rounded-lg"
              disabled={actionStatus === 'loading'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Role*</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full p-2 border rounded-lg"
              disabled={actionStatus === 'loading'}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={actionStatus === 'loading'}
          >
            {actionStatus === 'loading' ? 'Submitting...' : 'Request to Join'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default JoinClassForm