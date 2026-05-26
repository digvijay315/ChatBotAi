import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.base': 'नाम केवल शब्दों में होना चाहिए।',
    'string.empty': 'नाम लिखना अनिवार्य है।',
    'string.min': 'नाम कम से कम 2 अक्षरों का होना चाहिए।',
    'any.required': 'नाम दर्ज करना आवश्यक है।'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'कृपया एक वैध ईमेल पता (Valid Email Address) दर्ज करें।',
    'string.empty': 'ईमेल लिखना अनिवार्य है।',
    'any.required': 'ईमेल दर्ज करना आवश्यक है।'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'पासवर्ड कम से कम 6 अक्षरों या अंकों का होना चाहिए।',
    'string.empty': 'पासवर्ड लिखना अनिवार्य है।',
    'any.required': 'पासवर्ड दर्ज करना आवश्यक है।'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'कृपया एक वैध ईमेल पता (Valid Email Address) दर्ज करें।',
    'string.empty': 'ईमेल लिखना अनिवार्य है।',
    'any.required': 'ईमेल दर्ज करना आवश्यक है।'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'पासवर्ड लिखना अनिवार्य है।',
    'any.required': 'पासवर्ड दर्ज करना आवश्यक है।'
  })
});
