
async function adminLogin (req, res) {
 
  const { email, password } = req.body;

  if (req.cookies?.adminToken) {
    return res.status(400).json({ message: "Admin already logged in" });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Provide email and password" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail) {  
   return res.status(401).json({ message: "Invalid email or password" });
  }


  if (password !== adminPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  let requestIP = req.ip;

  if (requestIP.startsWith("::ffff:")) {
    requestIP = requestIP.split("::ffff:")[1];
  }
  
  res.cookie("adminToken", "admin_logged_in");
  return res.json({ message: "Admin Login successful", admin: { email: adminEmail, adminIP: requestIP } });
};

async function adminLogout (req, res) {
  res.clearCookie("adminToken");
  return res.json({ message: "Admin logged out" });
};

export { adminLogin, adminLogout };