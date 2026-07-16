const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


exports.authanticate = async (req, res, next) => {
    
        const authHeader = req.headers.authorization;
       console.log(authHeader);

       if(!authHeader?.startsWith('Bearer ')) 
        return res.status(401).json({error:"no token provided"});
       const token = authHeader.split(' ')[1];
     
     
     try{
         
   
       const decoded = jwt.verify(token, process.env.SECRET_KEY);
       console.log(decoded);
       const myUser = await User.findById(decoded.id);
       
        console.log(myUser);
        if(!myUser)
             return res.status(404).json({error:"invalid user"});
        req.user = myUser;
        next(); }

        

     catch(error){
         return res.status(401).json({msg:"invalid or expired token", err:error.message});

     }





};