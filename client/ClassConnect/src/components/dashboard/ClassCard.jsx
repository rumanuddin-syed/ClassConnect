import { motion } from 'framer-motion';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function ClassCard({ cls, type, onView, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleClick = () => {
    onView(cls.classId);
    // Or directly: navigate(`/class/${cls.classId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(cls);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(cls);
  };

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="w-full h-full bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="flex-grow p-4 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          {type === 'created' && (
            <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full font-medium">
              Admin
            </span>
          )}
          
          {type === 'created' && (
            <div className="flex gap-2">
              <button 
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100"
                aria-label="Edit class"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-100"
                aria-label="Delete class"
              >
                <FiTrash className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>


        {/* Rest of the card content remains same */}
        <div className={`${type === 'created' ? 'bg-blue-100' : 'bg-green-100'} p-3 rounded-lg mb-3 flex items-center justify-center`}>
          {/* Icon based on type */}
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">{cls.className}</h3>
        {cls.classDescription && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{cls.classDescription}</p>
        )}
        
        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <span className="bg-gray-100 text-gray-800 text-xs py-1 px-2 rounded-full">
              {cls.classId}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}