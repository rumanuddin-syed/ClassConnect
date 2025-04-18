import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const EditClassForm = ({ initialData, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData.className,
    description: initialData.classDescription || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Class</h3>
          <button onClick={onClose} disabled={loading}>
            <FaTimes className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Name*</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-lg"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded-lg"
              rows="3"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Class'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditClassForm;