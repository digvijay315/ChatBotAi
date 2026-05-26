import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mandir_secret_key_999';

// 1. Verify Standard JWT Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'अनधिकृत! कृपया पहले लॉगिन करें।' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Sets req.user = { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'अमान्य या समाप्त टोकन (Token expired/invalid)।' });
  }
};

// 2. Verify Admin Role
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'प्रतिबंधित! केवल मंदिर एडमिन ही यह बदलाव कर सकते हैं।' });
  }
  next();
};
