import Joi from 'joi'

const authSchema=Joi.object({
    emp_id:Joi.number().required(),
    fname:Joi.string().required(),
    lname:Joi.string(),
    address:Joi.object(),
    contact:Joi.number().required(),
    email:Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required()
})
const logSchema=Joi.object({
    emp_id:Joi.number().required(),
    password: Joi.string().min(2).required()
})
const updateSchema=Joi.object({
    fname:Joi.string().required(),
    lname:Joi.string(),
    address:Joi.object(),
    contact:Joi.number().required(),
    email:Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required()
})
export {authSchema,logSchema,updateSchema}