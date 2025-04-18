import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
  joinedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
  attendanceRecords: [
    {
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      attendedClasses: { type: Number, default: 0 },
      totalClasses: { type: Number, default: 0 },
    }
  ],
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 }
});

const User =mongoose.models.user|| mongoose.model('User',userSchema);

export default User;