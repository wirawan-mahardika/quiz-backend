import Joi from 'joi'

export const userRegisterValidate = Joi.object({
  email: Joi.string().email().min(11).max(100).required(),
  age: Joi.number().max(200).required(),
  username: Joi.string().min(6).max(20).required(),
  name: Joi.string().min(6).max(100).required(),
  password: Joi.string().min(6).max(20).required(),
})
  .required()
  .options({ allowUnknown: false });

export const userLoginValidate = Joi.object({
  email: Joi.string().email().min(11).max(100).required(),
  password: Joi.string().min(6).max(20).required(),
})
  .required()
  .options({ allowUnknown: false });

export const testResultValidate = Joi.object({
  id_subject: Joi.string().max(6).required(),
  data: Joi.object({
    id_question: Joi.number().max(1).required(),
    answer: Joi.string().max(1).required(),
  }).options({ allowUnknown: false }),
})
  .required()
  .options({ allowUnknown: false });