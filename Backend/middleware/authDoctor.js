import jwt from 'jsonwebtoken'

const authDoctor =async(req,res,next) =>{
    try{
        const {dtoken}=req.headers
        if(!dtoken)
        {
            return res.status(401).json({success:false,message:"not authorized login"})
        }
        const token_decode =jwt.verify(dtoken,process.env.JWT_SECRET)
        req.body.docId=token_decode.id
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

export default authDoctor