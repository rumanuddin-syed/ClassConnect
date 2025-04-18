import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: Date, required: true },
    records: [
      {
         studentId:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
         present:{ type: Boolean, default: false }
      }
    ],
  });


    const Attendance = mongoose.models.Attendance || mongoose.model("Attendance",attendanceSchema);

    export default Attendance;