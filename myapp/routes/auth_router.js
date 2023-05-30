import express from 'express'
const router = express.Router()
import Error from 'http-errors'
import fs from 'fs'
import _ from 'lodash'
import encrypt from 'bcrypt'
import passport from 'passport'
import jwt_decode from 'jwt-decode';
import {router as authMiddleware} from './passport.js'
import { authSchema,logSchema,updateSchema,adminSchema } from '../validation/auth_validation.js'
import {signAccessToken,verifyAccessToken} from '../token_generator/generate_token.js'
import RegEmp from '../database/registeredEmployes.json' assert {type: 'json'};
import admin from '../database/admin.json' assert {type: 'json'};

router.use(passport.initialize())
//router.use(passport.session());
verifyAccessToken(passport)
let updateEmp =[]

//define function to insert registered employees to file called registeredEmployes.json
const register = () => {
    fs.writeFile('./database/registeredEmployes.json',JSON.stringify(RegEmp),(err) => {
      if (err) {
        throw err;
      }
    });
  };
//define function to update registered employees to file called registeredEmployes.json
const update = () => {
  fs.writeFile('./database/registeredEmployes.json',JSON.stringify(updateEmp),(err) => {
      if (err) {
        throw err;
      }
    });
};

//define route to Home Page
router.get('/', authMiddleware,async(req,res,next) => {
  try{
    const header=req.headers['authorization'].split(" ")
    const decoded=jwt_decode(header[1])
    if(decoded.emp_id !='admin')
    {  
      const isexist = RegEmp.find((emplist) => emplist.emp_id === decoded.emp_id);
      res.status(200).json({message:"SUCCESS",Greet:`Hii ${isexist.fname}!!!... Welcome to TCS`})
    }
    else{
      throw Error.Unauthorized("Token is Invalid")
    }
  }catch(err)
  {
    next(err)
  }
})
//define route to Register Page
router.post('/api/register',async (req, res, next) => {
 
    try{
      if(_.isEmpty(req.body))
      {
        throw Error.BadRequest("Oopss!!!...Payload is missing");
      }
      else
      {
        const result= await authSchema.validateAsync(req.body)
        const salt=await encrypt.genSalt(10)
        const hashpwd=await encrypt.hash(result.password,salt)
        result.password=hashpwd
        const isexist = RegEmp.find((emplist) => emplist.emp_id === result.emp_id);
        //const accesstoken = await signAccessToken([req.body.Emp_id,req.body.Email])
        if (!isexist) 
        {
            RegEmp.push(result);
            register();
            res.status(200).json({
              message:"SUCCESS",
              response:`${result.emp_id} is successfully registered!!..`
              //access_token:accesstoken
            })
        } 
        else 
        {
            throw Error.Conflict(`Oops!!..${result.emp_id} is already been registered`)
        }
      }
    }
    catch(err)
    {
        if(err.isJoi===true) err.status = 422
        next(err)
    } 
})

//define route to Login Page
router.post('/api/login', async (req, res, next) => {
 
  try{
    if(_.isEmpty(req.body))
    {
      throw Error.BadRequest("Please provide Employee ID and Password")
    }
    else
    {
      const result= await logSchema.validateAsync(req.body)
      const  foundEmp= RegEmp.find((emplist) => emplist.emp_id === result.emp_id);
      if(!foundEmp) throw Error.NotFound(`${result.emp_id} is not registered`)
      const isMatch=await encrypt.compare(result.password,foundEmp.password)
      if(!isMatch) throw Error.Unauthorized("Employee Id or Password is not valid")
      const accesstoken = await signAccessToken([foundEmp.emp_id,foundEmp.password])
      res.status(200).json({Data:foundEmp,access_token:accesstoken})
    }
  }
  catch(err)
  {
      if(err.isJoi===true) return next(Error.BadRequest("Invalid Employee ID or Password"))
      next(err)
  } 
})

//define route to Update Page
router.put('/api/update/:id',authMiddleware, async (req, res, next) => {

  try{
    const header=req.headers['authorization'].split(" ")
    const decoded=jwt_decode(header[1])
    if(decoded.emp_id ==='admin')
    {  
      throw Error.Unauthorized("Sorry!!..Invalid token")
    }
    else
    {
 
   if(_.isEmpty(req.body))
    {
      throw Error.BadRequest(`Please provide payload for Employee ID ${req.params.id}`)
    }
    else
    {

      let result= await updateSchema.validateAsync(req.body)
      const salt=await encrypt.genSalt(10)
      const hashpwd=await encrypt.hash(result.password,salt)
      result.password=hashpwd
      let id={'emp_id':parseInt(req.params.id)}
      result ={...id,...result}
      updateEmp = RegEmp.map((emplist) => {
        
        if (emplist.emp_id === parseInt(req.params.id)) {
          return result;
        } else {
          return emplist;
        }
      });
      if(JSON.stringify(updateEmp)===JSON.stringify(RegEmp))
      {
        throw Error.NotFound(`No Such Record with given Employee ID ${req.params.id}`)
      }
      else
      {
        update();
        res.status(200).json({
          message: "SUCCESS",
          EmpInfo: result
        });
      }
    }
    }
  }
  catch(err)
  {
      if(err.isJoi===true) err.status = 422
      next(err)
  } 
})

//define route to Delete Page
router.delete('/api/delete/:id',authMiddleware, (req, res,next) => {

  try{
    const header=req.headers['authorization'].split(" ")
    const decoded=jwt_decode(header[1])
    if(decoded.emp_id !='admin')
    {  
      throw Error.Unauthorized("Sorry!!..You need admin Access...Please use admin token")
    }
    else
    {
      updateEmp= RegEmp.filter((emplist) => emplist.emp_id !== parseInt(req.params.id));
      if(JSON.stringify(updateEmp)=== JSON.stringify(RegEmp))
      {
        res.status(404).json({
          status: "FAILED",
          message: `No Such Record with Given Employee ID ${req.params.id}`,
          Count: RegEmp.length
        });
      
      }
      else
      {
        //console.log(updateEmp)
        update()
        res.status(200).json({
          status: "SUCCESS",
          message: `Employee ID ${req.params.id} is successfully Deleted`,
          Count: RegEmp.length-1
        });
      }  
    }  
  }
  catch(err)
  {
      next(err)
  } 
 
})

//define route to List Page
router.get('/api/allemps',authMiddleware, (req, res,next) => {
  try{
    const header=req.headers['authorization'].split(" ")
    const decoded=jwt_decode(header[1])
    if(decoded.emp_id==='admin')
    {  res.status(200).json({
      Data:RegEmp,
      Total_Count:RegEmp.length})
    }
    else
    {
      throw Error.Unauthorized("You need admin Access...Please use admin token") 
    }
  }
  catch(err)
  {
    next(err)
  }
})

//define route to Admin Home Page
router.get('/api/admin', authMiddleware,async(req,res,next) => {
  try{
    const header=req.headers['authorization'].split(" ")
    const decoded=jwt_decode(header[1])
    if(decoded.emp_id ==='admin')
    {  
      res.status(200).json({message:"SUCCESS",Greet:`Hii Admin!!!... Welcome to TCS`})
    }
    else
    {
      throw Error.Unauthorized("You need admin Access...Please use admin token") 
    }
  }catch(err)
  {
    next(err)
  }
})

//define route to Admin Login Page
router.post('/api/admin/login', async (req, res, next) => {
 
  try{
    if(_.isEmpty(req.body))
    {
     throw Error.Unauthorized("Please provide Username and Password")
    }
    else
    {
      const result= await adminSchema.validateAsync(req.body)
      const  foundad= admin.find((emplist) => emplist.username === result.username);
      if(!foundad) throw Error.NotFound("Admin Username or Password is not valid")
      const isMatch=await encrypt.compare(result.password,foundad.password)
      if(!isMatch) throw Error.Unauthorized("Admin Username or Password is not valid")
      const accesstoken = await signAccessToken([foundad.username,foundad.password])
      res.status(200).json({message:"Congratulation!!..Admin Successfully Logged In..",Data:foundad,access_token:accesstoken})
    }
  }
  catch(err)
  {
      if(err.isJoi===true) return next(Error.BadRequest("Invalid Username or Password"))
      next(err)
  } 
})
export {router}