import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const secret = "$@BidSphere"

// Generate JWT Token
function setUser (user) {
    
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
        },
        secret
    );
}

// Verify JWT Token
function getUser (token) {

    if(!token) return null;

    return jwt.verify(token, secret);
}

// Generate Hash password
async function generateHashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export { setUser, getUser, generateHashPassword };