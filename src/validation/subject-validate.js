import Joi from "joi";

export const createSubjectAndTopicSchema = Joi.object({
  name: Joi.string().required().max(100),
  topic: Joi.string().required().max(100),
})
  .required()
  .options({ allowUnknown: false });

export const updateSubjectAndTopicSchema = Joi.object({
  id_subject: Joi.string().required().max(6).min(6),
  name: Joi.string().required().max(100),
  topic: Joi.string().required().max(100),
})
  .required()
  .options({ allowUnknown: false });
