import Joi from 'joi';

export const templeUpdateSchema = Joi.object({
  name: Joi.string().required().messages({ 'any.required': 'मंदिर का नाम अनिवार्य है।' }),
  deity: Joi.string().required().messages({ 'any.required': 'मुख्य देवी-देवता का नाम अनिवार्य है।' }),
  location: Joi.string().required().messages({ 'any.required': 'स्थान/पता अनिवार्य है।' }),
  history: Joi.string().required().messages({ 'any.required': 'इतिहास अनिवार्य है।' }),
  timings: Joi.array().items(
    Joi.object({
      name: Joi.string().required().messages({ 'any.required': 'समय का नाम अनिवार्य है।' }),
      time: Joi.string().required().messages({ 'any.required': 'समय दर्ज करना अनिवार्य है।' })
    }).unknown(true)
  ).required(),
  rules: Joi.array().items(Joi.string()).required(),
  festivals: Joi.array().items(
    Joi.object({
      name: Joi.string().required().messages({ 'any.required': 'त्योहार का नाम अनिवार्य है।' }),
      date: Joi.string().required().messages({ 'any.required': 'तिथि अनिवार्य है।' }),
      description: Joi.string().required().messages({ 'any.required': 'विवरण अनिवार्य है।' })
    }).unknown(true)
  ).required(),
  donations: Joi.string().required().messages({ 'any.required': 'दान का विवरण अनिवार्य है।' }),
  contact: Joi.string().required().messages({ 'any.required': 'संपर्क विवरण अनिवार्य है।' }),
  customSections: Joi.array().items(
    Joi.object({
      title: Joi.string().required().messages({ 'any.required': 'अनुभाग का शीर्षक अनिवार्य है।' }),
      content: Joi.string().required().messages({ 'any.required': 'अनुभाग की सामग्री अनिवार्य है।' })
    }).unknown(true)
  ).optional()
}).unknown(true);
