import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InvitationItem from '../shared/InvitationItem';
import { 
  fetchInvitations, 
  acceptInvitation, 
  rejectInvitation,
  clearInvitationState
} from '../../redux/slices/invitationSlice';

const InvitationsTab = ({ role }) => {
  const { classroomId } = useParams();
  const dispatch = useDispatch();
  const { 
    invitations, 
    loading, 
    error, 
    success 
  } = useSelector((state) => state.invitations);

  useEffect(() => {
    if (classroomId) {
      dispatch(fetchInvitations(classroomId));
    }

    return () => {
      dispatch(clearInvitationState());
    };
  }, [dispatch, classroomId]);

  const handleAccept = (userId, userRole) => {
    dispatch(acceptInvitation({ 
      classroomId, 
      reqUserId: userId, 
      role: userRole 
    }));
  };

  const handleReject = (reqUserId) => {
    dispatch(rejectInvitation({ 
      classroomId, 
      reqUserId
    }));
  };

  if (loading && invitations.length === 0) {
    return (
      <div className="flex justify-center items-center h-24 md:h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 md:px-0">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center md:text-left">
        Pending Invitations
      </h2>
      
      {error && (
        <div className="p-2 md:p-3 bg-red-100 text-red-700 rounded-md mb-3 md:mb-4 text-sm md:text-base">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-2 md:p-3 bg-green-100 text-green-700 rounded-md mb-3 md:mb-4 text-sm md:text-base">
          {success}
        </div>
      )}
      
      {!loading && invitations.length === 0 ? (
        <div className="p-3 md:p-4 bg-gray-50 rounded-lg text-center text-sm md:text-base">
          <p className="text-gray-500">No pending invitations</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {invitations.map(invite => (
            <InvitationItem 
              key={invite.invitationId}
              invite={invite}
              role={role}
              onAccept={handleAccept}
              onReject={handleReject}
              className="text-sm md:text-base"
            />
          ))}
        </div>
      )}

      {loading && invitations.length > 0 && (
        <div className="flex justify-center mt-3 md:mt-4">
          <div className="animate-spin rounded-full h-4 w-4 md:h-6 md:w-6 border-b-2 border-gray-400"></div>
        </div>
      )}
    </div>
  );
};

export default InvitationsTab;