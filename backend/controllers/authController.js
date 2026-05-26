import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mandir_secret_key_999';

// 1. Devotee User Registration
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'यह ईमेल पहले से पंजीकृत है।' });
    }

    // Hash password using windws-safe bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: 'पंजीकरण सफलतापूर्वक पूर्ण हुआ! कृपया लॉगिन करें।',
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'पंजीकरण विफल रहा।', details: err.message });
  }
};

// 2. Devotee User Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'ईमेल या पासवर्ड अमान्य है।' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'ईमेल या पासवर्ड अमान्य है।' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' } // 7 Days expiration
    );

    res.json({
      message: 'लॉगिन सफल रहा!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ error: 'लॉगिन विफल रहा।', details: err.message });
  }
};

// 3. Admin Login (admin@gmail.com / admin@123)
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Strict Admin credentials requested by user
  if (email === 'admin@gmail.com' && password === 'admin@123') {
    const token = jwt.sign(
      { id: '507f1f77bcf86cd799439011', email: 'admin@gmail.com', name: 'मुख्य एडमिन', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'एडमिन लॉगिन सफल रहा! स्वागत है।',
      token,
      user: { id: '507f1f77bcf86cd799439011', name: 'Admin', email: 'admin@gmail.com', role: 'admin' }
    });
  } else {
    return res.status(400).json({ error: 'अमान्य एडमिन ईमेल या पासवर्ड!' });
  }
};
