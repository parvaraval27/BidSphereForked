import User from "../models/User.js"; 
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { setUser , generateHashPassword} from "../services/auth.js";
import { SendVerificationCode, WelcomeEmail, SendResetPwdEmail } from "../services/email.sender.js";



async function handleRegister (req, res) {
  try {
    const { username, email, password} = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are Required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await generateHashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() *900000).toString();

    User.create({
      username,
      email,
      password: hashedPassword,
      verificationCode
    });

    SendVerificationCode(email, verificationCode);
    res.status(201).json({ message: "User registered successfully" });
  }
   catch (err) {
    console.error("user register error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
    
}

async function handleLogin (req, res) {
  try {
    const userToken = req.cookies?.token;

    if(userToken) 
      return res.status(400).json({message:"You are already logged in, go to home page"});

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Provide email and password" });
    }

    const user = await User.findOne({ email });  
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Email not verified" });
    }

    const token = setUser(user);
    res.cookie("token", token);
    
    return res.json({ message: "Login successful", token, user: { username: user.username, email: user.email } });
  }
   catch (err) {
    console.error("user login error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

async function handleLogout (req, res) {
  try {
    //Clear the token cookie
    res.clearCookie("token");

   return res.json({ message: "Logged out" });
  }
  catch (err) {
    console.error("user logout error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

async function verifyEmail (req, res) {
  try{
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email, verificationCode: code });
    // console.log(user);
    if (!user) {
        return res.status(400).json({ message: "Invalid User" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    WelcomeEmail(user.email, user.username);
    return res.status(200).json({ message: "Email Verified Successfully" })
  }
  catch(err){
    console.error("email verification error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

async function handleResetPwdEmail (req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Enter your verified email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(404).json({ message: "User is not verifid yet, first verify your email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // const resetPwdLink = `${process.env.FRONTEND_URL}/bidsphere/user/resetpwd?token=${resetToken}`;
                      // FRONTEND_URL = https://bidsphere.vercel.app

    const resetPwdLink = `http://localhost:5000/bidsphere/user/resetpwd?token=${resetToken}`;

    SendResetPwdEmail(email, resetPwdLink);

    return res.status(200).json({ success: true, message: "Reset Password link is shared in your Email"});
  }
  catch (error) {
    console.error("Send Reset Password email error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function handleResetPwd (req, res) {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (isMatch) {
      return res.status(400).json({ message: "New password must be different from old password" });
    }

    const hashedPassword = await generateHashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } 
  catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { handleRegister , handleLogin, handleLogout, verifyEmail, handleResetPwdEmail, handleResetPwd };