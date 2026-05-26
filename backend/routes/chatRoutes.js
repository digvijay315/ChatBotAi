import express from 'express';
import { 
  getSessions, 
  createSession, 
  deleteSession, 
  getSessionMessages, 
  postMessage 
} from '../controllers/chatController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { chatQuerySchema } from '../validations/chatValidation.js';

const router = express.Router();

// Apply JWT verification middleware to all chat/session routes
router.use(verifyToken);

// 1. Get all chat sessions of a devotee
router.get('/sessions', getSessions);

// 2. Create a new chat session thread
router.post('/sessions/new', createSession);

// 3. Delete a chat session and all its messages
router.delete('/sessions/:id', deleteSession);

// 4. Get chat history of a session
router.get('/sessions/:id/messages', getSessionMessages);

// 5. Ask Bot (RAG query inside a session)
router.post('/chat', validateBody(chatQuerySchema), postMessage);

export default router;
