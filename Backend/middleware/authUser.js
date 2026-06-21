import jwt from 'jsonwebtoken'

const authUser =async(req,res,next) =>{
    try{
        
        const {token}=req.headers
        if(!token)
        {
            return res.status(401).json({success:false,message:"not authorized login again"})

        }
        const token_decode =jwt.verify(token,process.env.JWT_SECRET)

        req.body.userId=token_decode.id
        next()
    }
    catch(error)
    {
        console.log(error)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        res.status(401).json({success:false,message:"Invalid Credentials"})
    }
}

export default authUser