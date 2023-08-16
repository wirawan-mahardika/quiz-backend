import Joi from "joi";

export const createSubjectAndTopicSchema = Joi.object({
  subject: Joi.string().required().max(100),
  topic: Joi.string().required().max(100),
})
  .required()
  .options({ allowUnknown: false });
