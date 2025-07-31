// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const COOKIE_NAME = "token";

// SIGNUP
export const signup = async (req,res)=>{
    try {
      const {name,userEmail,password,confirmPassword} = req.body;

      // const existinguser = await User.findOne({name});
      // if(existinguser){
      //   console.log("user already exist");
      // }

      const CreateUser = User.create({
        name:name,
        userEmail:userEmail,
        password:password,
      })

      if(CreateUser){ 
        CreateUser.save();
        return res.json({"signup successfull":CreateUser});
      }

    } catch (error) {
      console.log("error in signup")
      console.log(error)
    }
}


// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Logged in successfully", user });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
