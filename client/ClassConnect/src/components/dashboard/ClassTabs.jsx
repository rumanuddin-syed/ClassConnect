import { FaChalkboardTeacher, FaUserFriends } from 'react-icons/fa'

export default function ClassTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-blue-200 mb-6">
      <button
        onClick={() => setActiveTab('created')}
        className={`py-2 px-4 font-medium flex items-center space-x-2 ${
          activeTab === 'created' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-blue-400 hover:text-blue-600'
        }`}
      >
        <FaChalkboardTeacher />
        <span>My Admin Classes </span>
      </button>
      <button
        onClick={() => setActiveTab('joined')}
        className={`py-2 px-4 font-medium flex items-center space-x-2 ${
          activeTab === 'joined' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-blue-400 hover:text-blue-600'
        }`}
      >
        <FaUserFriends />
        <span>Enrolled Classes</span>
      </button>
    </div>
  )
}