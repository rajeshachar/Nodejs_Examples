import express from 'express'
const router = express.Router()
import Error from 'http-errors'
import fs from 'fs'
import isEmpty from 'lodash.isempty'
import encrypt from 'bcrypt'
import { authSchema,logSchema,updateSchema } from '../validation/auth_validation.js'
import {signAccessToken,verifyAccessToken} from '../token_generator/generate_token.js'
import RegEmp from './registeredEmployes.json' assert {type: 'json'};


let updateEmp =[]
//define function to insert registered employees to file called registeredEmployes.json
const register = () => {
    fs.writeFile('./routes/registeredEmployes.json',JSON.stringify(RegEmp),(err) => {
      if (err) {
        throw err;
      }
    });
  };
//define function to update registered employees to file called registeredEmployes.json
const update = () => {
  fs.writeFile('./routes/registeredEmployes.json',JSON.stringify(updateEmp),(err) => {
      if (err) {
        throw err;
      }
    });
};
//define route to Home Page
router.get('/', verifyAccessToken, async (req, res,next) => {
  res.status(200).json({message:"SUCCESS",Greet:"Welcome to TCS"})
})
//define route to Register Page
router.post('/api/register',async (req, res, next) => {
 
    try{
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
    catch(err)
    {
        if(err.isJoi===true) err.status = 422
        next(err)
    } 
})

//define route to Login Page
router.post('/api/login', async (req, res, next) => {
 
  try{
      const result= await logSchema.validateAsync(req.body)
      const  foundEmp= RegEmp.find((emplist) => emplist.emp_id === result.emp_id);
      if(!foundEmp) throw Error.NotFound(`${result.emp_id} is not registered`)
      const isMatch=await encrypt.compare(result.password,foundEmp.password)
      if(!isMatch) throw Error.Unauthorized("Employee Id or Password is not valid")
      const accesstoken = await signAccessToken([foundEmp.emp_id,foundEmp.password])
      res.status(200).json({Data:foundEmp,access_token:accesstoken})
  }
  catch(err)
  {
      if(err.isJoi===true) return next(Error.BadRequest("Invalid Employee ID or Password"))
      next(err)
  } 
})

//define route to Update Page
router.put('/api/update/:id',verifyAccessToken, async (req, res, next) => {

  try{
   if(isEmpty(req.body))
    {
      res.status(404).json({
        message: "FAILED",
        error: `Please provide payload for Employee ID ${req.params.id}`
      });
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
        res.status(404).json({
          message: "FAILED",
          error: `No Such Record with given Employee ID ${req.params.id}`
        });
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
  catch(err)
  {
      if(err.isJoi===true) err.status = 422
      next(err)
  } 
})

//define route to Delete Page
router.delete('/api/delete/:id',verifyAccessToken, (req, res,next) => {

  try{
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
  catch(err)
  {
      next(err)
  } 
 
})

//define route to List Page
router.get('/api/allemps',verifyAccessToken, (req, res,next) => {
  res.status(200).json({
    Data:RegEmp,
    Total_Count:RegEmp.length})
})


export {router}