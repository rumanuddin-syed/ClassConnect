// In your EmptyState.jsx
export default function EmptyState({ type, onAction, searchQuery }) {
  return (
    <div className="text-center py-12">
      {searchQuery ? (
        <>
          <div className="text-gray-400 mb-4 text-4xl">🔍</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No classes found
          </h3>
          <p className="text-gray-600 mb-4">
            No results for "{searchQuery}"
          </p>
        </>
      ) : (
        <>
          <div className="text-blue-400 mb-4 text-4xl">
            {type === 'created' ? '📚' : '👩‍🎓'}
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No {type === 'created' ? 'created' : 'joined'} classes yet
          </h3>
          <p className="text-gray-600 mb-4">
            {type === 'created' 
              ? 'Create your first class to get started' 
              : 'Join a class to begin learning'}
          </p>
          <button
            onClick={onAction}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {type === 'created' ? 'Create Class' : 'Join Class'}
          </button>
        </>
      )}
    </div>
  )
}