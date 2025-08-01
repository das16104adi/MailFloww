// models/User.js
import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
