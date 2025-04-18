import User from '../models/userModel.js';


export const getUserDetails = async (req, res) => {
    try {
      const userId = req.user.id; // or req.params.user_id depending on your route
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }
  
      // Find the user and populate the createdClasses and joinedClasses arrays to get their counts
      const user = await User.findById(userId)
        .select('name email createdClasses joinedClasses')
        .exec();
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      // Prepare the response data
      const userData = {
        id:userId,
        name: user.name,
        email: user.email,
        number_of_created_classes: user.createdClasses.length,
        number_of_joined_classes: user.joinedClasses.length
      };
  
      res.status(200).json({
        success: true,
        data: userData
      });
  
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
  