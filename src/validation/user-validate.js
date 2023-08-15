import Joi from 'joi'

export const userRegisterValidate = Joi.object({
  email: Joi.string().email().min(11).max(100),
  name: Joi.string().min(6).max(100).required(),
  username: Joi.string().min(6).max(20),
  password: Joi.string().min(6).max(20),
  age: Joi.number().max(200).required(),
})
  .required()
  .options({ allowUnknown: false });

export const userLoginValidate = Joi.object({
    email: Joi.string().email().min(11).max(100),
    password: Joi.string().min(6).max(20)
}).required().options({allowUnknown: false})