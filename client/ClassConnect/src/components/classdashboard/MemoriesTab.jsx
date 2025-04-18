import { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaPlus, FaUser, FaSpinner, FaCalendar, FaWater } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  createMemory,
  editMemory,
  deleteMemory,
  getMemories,
  clearMemoryError
} from '../../redux/slices/memorySlice';

const MemoriesTab = ({ role }) => {
  const { classroomId } = useParams();
  const dispatch = useDispatch();
  const { memories, loading, crudLoading, error } = useSelector((state) => state.memories);
  const currentUser = useSelector((state) => state.user);

  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    imagePreview: null,
    editingId: null
  });

  useEffect(() => {
    dispatch(getMemories(classroomId));
  }, [classroomId, dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (crudLoading) return;

    const memoryData = new FormData();
    memoryData.append('title', formData.title);
    memoryData.append('description', formData.description);
    if (formData.image) memoryData.append('image', formData.image);

    try {
      if (formData.editingId) {
        await dispatch(editMemory({
          classId: classroomId,
          Memoryid: formData.editingId,
          title: formData.title,
          description: formData.description,
          image: formData.image
        }));
      } else {
        await dispatch(createMemory({
          classId: classroomId,
          title: formData.title,
          description: formData.description,
          image: formData.image
        }));
      }
      dispatch(getMemories(classroomId));
      resetForm();
    } catch (err) {
      console.error('Operation failed:', err);
    }
  };

  const handleEdit = (memory) => {
    setFormData({
      ...formData,
      title: memory.title,
      description: memory.description,
      imagePreview: memory.imageUrl,
      editingId: memory._id
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (memoryId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      await dispatch(deleteMemory({ classId: classroomId, Memoryid: memoryId }));
      dispatch(getMemories(classroomId));
    }
  };

  const resetForm = () => {
    setIsEditModalOpen(false);
    setSelectedMemory(null);
    setFormData({
      title: '',
      description: '',
      image: null,
      imagePreview: null,
      editingId: null
    });
    dispatch(clearMemoryError());
  };

  const canEditMemory = (memory) => {
    return role === 'admin' || memory.creatorId._id === currentUser.userId;
  };

  const canDeleteMemory = (memory) => {
    return role === 'admin' || memory.creatorId._id === currentUser.userId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4 md:p-6 relative overflow-hidden">
      {/* Decorative Waves */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="wave wave1 bg-blue-200"></div>
        <div className="wave wave2 bg-indigo-200"></div>
        <div className="wave wave3 bg-sky-200"></div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 relative z-10">
        <div className="text-center mb-4 md:mb-0">
          <h2 className="text-4xl font-bold text-blue-900 font-serif flex items-center gap-3">
            <FaWater className="text-blue-500 animate-pulse" />
            Memory Stream
            <FaWater className="text-blue-500 animate-pulse delay-75" />
          </h2>
          <p className="text-blue-700 mt-2 italic">Flowing moments of learning</p>
        </div>
        
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl
          shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
          disabled={crudLoading}
        >
          {crudLoading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <>
              <FaPlus className="transition-transform group-hover:rotate-90" />
              <span>Add Memory</span>
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={resetForm}>
          <div className="bg-white rounded-xl w-full max-w-xl p-6 relative
            border-4 border-blue-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              {formData.editingId ? '✏️ Edit Memory' : '📸 Create Memory'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-700 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border-2 border-blue-100 rounded-xl focus:border-blue-300"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-blue-700 mb-2 font-medium">Description</label>
                <textarea
                  required
                  className="w-full p-3 border-2 border-blue-100 rounded-xl h-32 focus:border-blue-300"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-blue-700 mb-2 font-medium">Image</label>
                <div className="relative border-2 border-dashed border-blue-100 rounded-xl p-4
                  hover:border-blue-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center text-blue-500">
                    <p className="mb-2">Click to upload image</p>
                    <p className="text-sm text-blue-400">(JPEG, PNG, GIF)</p>
                  </div>
                </div>
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="mt-4 w-32 h-32 object-cover rounded-xl border-2 border-blue-100"
                  />
                )}
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                    flex items-center gap-2 transition-colors"
                  disabled={crudLoading}
                >
                  {crudLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : formData.editingId ? (
                    <>
                      <FaEdit />
                      Update
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Memories Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-32 relative z-10">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
          {memories.map((memory) => (
            <div
              key={memory._id}
              className="group relative bg-white rounded-xl shadow-lg overflow-hidden
              cursor-pointer transition-all duration-300 hover:-translate-y-2
              border-2 border-blue-100 hover:border-blue-200"
              onClick={() => setSelectedMemory(memory)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={memory.imageUrl} 
                  alt={memory.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/40" />
                
                {(canEditMemory(memory) || canDeleteMemory(memory)) && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    {canEditMemory(memory) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(memory);
                        }}
                        className="p-2 bg-white/90 rounded-lg hover:bg-white text-blue-600
                          backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDeleteMemory(memory) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(memory._id);
                        }}
                        className="p-2 bg-white/90 rounded-lg hover:bg-white text-red-600
                          backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-900 truncate flex items-center gap-2">
                  <span className="bg-blue-100 px-2 py-1 rounded-full text-sm">📌</span>
                  {memory.title}
                </h3>
                <div className="flex items-center justify-between text-blue-600 text-sm">
                  <span className="flex items-center gap-1">
                    <FaUser className="w-4 h-4" />
                    {memory.creatorId._id === currentUser.userId ? 'You' : memory.creatorId.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendar className="w-4 h-4" />
                    {new Date(memory.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-blue-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMemory(null)}>
          <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] overflow-hidden shadow-2xl
            border-4 border-blue-100"
            onClick={(e) => e.stopPropagation()}>
            
            <div className="relative h-1/2 bg-blue-100">
              <img
                src={selectedMemory.imageUrl}
                alt={selectedMemory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/60 to-transparent p-6">
                <h3 className="text-3xl font-bold text-white">{selectedMemory.title}</h3>
                <div className="flex items-center gap-4 text-blue-100 mt-2">
                  <span className="flex items-center gap-1">
                    <FaUser className="w-5 h-5" />
                    {selectedMemory.creatorId._id === currentUser.userId 
                      ? 'You' 
                      : selectedMemory.creatorId.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendar className="w-5 h-5" />
                    {new Date(selectedMemory.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-1/2 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-blue-50 to-white">
              <div className="prose max-w-none text-blue-800">
                <p className="text-lg leading-relaxed border-l-4 border-blue-200 pl-4 italic
                  before:content-['“'] before:text-4xl before:text-blue-300 before:mr-2
                  after:content-['”'] after:text-4xl after:text-blue-300 after:ml-2">
                  {selectedMemory.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .wave {
          position: absolute;
          bottom: 0;
          width: 200%;
          height: 12em;
          animation: wave 10s -3s linear infinite;
          transform: translate3d(0, 0, 0);
          opacity: 0.4;
        }
        .wave1 {
          animation-duration: 12s;
          left: -50%;
          border-radius: 40%;
          background-color: #bfdbfe;
        }
        .wave2 {
          animation-duration: 15s;
          left: -30%;
          border-radius: 45%;
          background-color: #a5b4fc;
        }
        .wave3 {
          animation-duration: 18s;
          left: -20%;
          border-radius: 35%;
          background-color: #93c5fd;
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MemoriesTab;