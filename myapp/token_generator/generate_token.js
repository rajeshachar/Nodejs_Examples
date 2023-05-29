import JWT from 'jsonwebtoken'
import ERROR from 'http-errors'
import dotenv from 'dotenv'
import { Strategy, ExtractJwt } from 'passport-jwt';
import RegEmp from '../database/registeredEmployes.json' assert {type: 'json'};
dotenv.config()
const signAccessToken = (id)=>{
    return new Promise((resolve,reject)=>{
        const jwt_payload={
            emp_id:id[0]
        }
        const secret = process.env.ACCESS_TOKEN_SECRET
        const options={
            expiresIn:'30m',
            audience:id
        }
        JWT.sign(jwt_payload,secret,options,(err,token)=>{
            if(err)
            {
                console.log(err.message)
                reject(ERROR.InternalServerError())
            }
            resolve(token)
        })
    })
}
const verifyAccessToken = (passport)=>{
    const options={}
    options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    options.secretOrKey = process.env.ACCESS_TOKEN_SECRET
    passport.use(
      new Strategy(options, (jwt_payload, done) => {
        const user = RegEmp.find((emplist) =>emplist.emp_id === jwt_payload.emp_id);
        if (!user) return done(null, false)
        else return done(null,user)
        })
    );
}

// const verifyAccessToken = (req,res,next)=>{
//     if(!req.headers['authorization']) return next(ERROR.Unauthorized())
//     const authheader = req.headers['authorization']
//     const bearertoken =authheader.split(' ')
//     const token = bearertoken[1]
//     JWT.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
//         if(err)
//         {
//             const message= err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
//             return next(ERROR.Unauthorized(message))
//         }

//         req.payload=payload
//         next()
//     })

// }

 export {signAccessToken,verifyAccessToken}