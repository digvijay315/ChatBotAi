import Joi from 'joi';

export const chatQuerySchema = Joi.object({
  message: Joi.string().required().messages({
    'string.empty': 'संदेश खाली नहीं हो सकता।',
    'any.required': 'संदेश दर्ज करना अनिवार्य है।'
  }),
  sessionId: Joi.string().required().messages({
    'any.required': 'चैट सत्र (Session ID) आवश्यक है।'
  }),
  latitude: Joi.number().allow(null).optional(),
  longitude: Joi.number().allow(null).optional()
});
