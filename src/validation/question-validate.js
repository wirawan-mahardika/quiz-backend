import Joi from "joi";

export const createQuestionSchema = Joi.object({
  id_subject: Joi.string().max(6).min(6).required(),
  question: Joi.string().max(65530).min(5).required(),
  a: Joi.string().max(100).min(1).required(),
  b: Joi.string().max(100).min(1).required(),
  c: Joi.string().max(100).min(1).required(),
  d: Joi.string().max(100).min(1).required(),
  e: Joi.string().max(100).min(1).required(),
  answer: Joi.string().max(1).length(1).required(),
})
  .required()
  .options({ allowUnknown: false });

export const getQuestionSchema = Joi.object({
  id_subject: Joi.string().max(100).required(),
})
  .required()
  .options({ allowUnknown: false });

export const createManyQuestionSchema = Joi.object({
  id_subject: Joi.string().max(6).min(6).required(),
  datas: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().max(65530).min(5).required(),
        a: Joi.string().max(100).min(1).required(),
        b: Joi.string().max(100).min(1).required(),
        c: Joi.string().max(100).min(1).required(),
        d: Joi.string().max(100).min(1).required(),
        e: Joi.string().max(100).min(1).required(),
        answer: Joi.string().max(1).length(1).required(),
      }).required()
    )
    .required(),
})
  .required()
  .options({ allowUnknown: false });