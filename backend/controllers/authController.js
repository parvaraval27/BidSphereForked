import User from "../models/User.js"; 
import bcrypt from "bcryptjs";
import { setUser , generateHashPassword} from "../services/auth.js";
import { SendVerificationCode, WelcomeEmail } from "../services/email.sender.js";



async function handleRegister (req, res) {

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

async function handleLogin (req, res) {
  
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
  
};

async function handleLogout (req, res) {
  //Clear the token cookie
  res.clearCookie("token");

  return res.json({ message: "Logged out" });
};

async function verifyEmail (req, res) {
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

export { handleRegister , handleLogin, handleLogout, verifyEmail };