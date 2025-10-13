import { getUser } from "../services/auth.js";

async function restrictToLoggedinUserOnly (req, res, next){
    
    const userToken = req.cookies?.token;

    if(!userToken) 
      return res.status(400).json({message:"You are not logged in, go to login page"});
    
    const user = await getUser(userToken);

    if(!user) 
      return res.status(400).json({message:"The user belonging to this token does no longer exist."});
    
    req.user = user;
    next();
}

async function checkAuth (req, res, next){
    
    const userToken = req.cookies?.token;

    const user = await getUser(userToken);
    
    req.user = user;
    next();
}

export {
    restrictToLoggedinUserOnly,
    checkAuth
}