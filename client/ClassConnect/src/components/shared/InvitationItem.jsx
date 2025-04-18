import { FaCheck, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import ConfirmationModal from './ConfirmationModal';

const InvitationItem = ({ invite, role, onAccept, onReject }) => {
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      // Pass the invitation ID along with user data
      await onAccept( invite.userId, invite.role);
    } finally {
      setIsProcessing(false);
      setShowAcceptModal(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      // Pass the invitation ID
      await onReject(invite.userId);
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
    }
  };

  return (
    <>
      <div className="p-4 bg-white rounded-lg shadow border flex justify-between items-center hover:shadow-md transition-shadow">
        <div>
          <h3 className="font-medium text-gray-800">{invite.name}</h3>
          <p className="text-sm text-gray-500">
            Requested as: <span className="capitalize">{invite.role}</span>
            {invite.requestedAt && (
              <span className="ml-2">
                • {new Date(invite.requestedAt).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        
        {role === 'admin' ? (
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowAcceptModal(true)}
              disabled={isProcessing}
              className={`p-2 rounded-full ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'}`}
              aria-label="Accept invitation"
            >
              <FaCheck />
            </button>
            <button 
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className={`p-2 rounded-full ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : 'text-red-600 hover:bg-red-100'}`}
              aria-label="Reject invitation"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Pending approval</span>
        )}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        title="Accept Invitation"
        message={`Are you sure you want to accept ${invite.name} as a ${invite.role}?`}
        confirmText={isProcessing ? 'Accepting...' : 'Accept'}
        confirmColor="green"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Invitation"
        message={`Are you sure you want to reject ${invite.name}'s request to join as ${invite.role}?`}
        confirmText={isProcessing ? 'Rejecting...' : 'Reject'}
        confirmColor="red"
        isLoading={isProcessing}
      />
    </>
  );
};

export default InvitationItem;