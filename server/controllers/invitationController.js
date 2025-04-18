import Classroom from "../models/classroomModel.js";
import User from "../models/userModel.js";

export const getInvitations = async (req, res) => {
    try {
        const { classroomId } = req.query;
        
        if (!classroomId) {
            return res.status(400).json({ 
                success: false,
                message: 'Classroom ID is required' 
            });
        }

         const classroom = await Classroom.findById(classroomId)

        if (!classroom) {
            return res.status(404).json({ 
                success: false,
                message: 'Classroom not found' 
            });
        }
        const invitations = classroom.joinRequests.map(request => ({
            invitationId: request.user,
            userId: request.user,
            name: request.name,
            role: request.role,
            requestedAt: request.requestedAt
        }));
        res.status(200).json({
            success: true,
            invitations
        });
    } catch (error) {
        console.error('Get invitations error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

export const acceptInvitation = async (req, res) => {
    try {
        const { classroomId, reqUserId, role } = req.body;
        const userId = req.user.id;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ 
                success: false,
                message: 'Classroom not found' 
            });
        }

        if (classroom.admin.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Only classroom admin can accept invitations' 
            });
        }
        classroom.joinRequests = classroom.joinRequests.filter(
          invite => !invite.user.equals(reqUserId)
      );

        classroom.members.push({ user: reqUserId, role });
        await classroom.save();

        await User.findByIdAndUpdate(
            reqUserId,
            { $addToSet: { joinedClasses: classroomId } }
        );

        res.status(200).json({ 
            success: true,
            message: 'Invitation accepted successfully',
            reqUserId
        });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};

export const rejectInvitation = async (req, res) => {
    try {
        const { classroomId, reqUserId } = req.body;
        const userId = req.user.id;

        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return res.status(404).json({ 
                success: false,
                message: 'Classroom not found' ,
                req
            });
        }

        if (classroom.admin.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Only classroom admin can reject invitations' ,

            });
        }
        classroom.joinRequests = classroom.joinRequests.filter(
          invite => !invite.user.equals(reqUserId)
      );

        await classroom.save();

        res.status(200).json({ 
          success: true,
          message: 'Invitation rejected successfully',
          reqUserId
      });
           
    } catch (error) {
        console.error('Reject invitation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error' 
        });
    }
};