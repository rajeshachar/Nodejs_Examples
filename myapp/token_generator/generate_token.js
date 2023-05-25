import JWT from 'jsonwebtoken'
import ERROR from 'http-errors'
import dotenv from 'dotenv'
dotenv.config()
const signAccessToken = (id)=>{
    return new Promise((resolve,reject)=>{
        const payload={
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options={
            expiresIn:'30m',
            audience:id
        }
        JWT.sign(payload,secret,options,(err,token)=>{
            if(err)
            {
                console.log(err.message)
                reject(ERROR.InternalServerError())
            }
            resolve(token)
        })
    })
}
const verifyAccessToken = (req,res,next)=>{
    if(!req.headers['authorization']) return next(ERROR.Unauthorized())
    const authheader = req.headers['authorization']
    const bearertoken =authheader.split(' ')
    const token = bearertoken[1]
    JWT.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
        if(err)
        {
            const message= err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
            return next(ERROR.Unauthorized(message))
        }

        req.payload=payload
        next()
    })

}

 export {signAccessToken,verifyAccessToken}