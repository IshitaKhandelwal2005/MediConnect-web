import jwt from 'jsonwebtoken'

const authAdmin =async(req,res,next) =>{
    try{

        const {atoken}=req.headers
        if(!atoken)
        {
            return res.status(401).json({success:false,message:"not authorized login again"})

        }
        const token_decode =jwt.verify(atoken,process.env.JWT_SECRET)

        if(token_decode.email !== process.env.ADMIN_EMAIL || token_decode.role !== 'admin')
        {
            return res.status(401).json({success:false,message:"not authorized login again"})
        }
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

export default authAdmin