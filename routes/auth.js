const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validate, schemas } = require('../middleware/validation');
const router = express.Router();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.roleNom 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register new user
router.post('/register', validate(schemas.userRegister), async (req, res) => {
  try {
    const { nom, email, motDePasse, roleId } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = await User.create({ nom, email, motDePasse, roleId });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.roleNom
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validate(schemas.userLogin), async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(motDePasse, user.motDePasse);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.roleNom
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', require('../middleware/auth').authenticateToken, async (req, res) => {
  try {
    const profile = await User.getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Remove sensitive data
    delete profile.motDePasse;

    res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', 
  require('../middleware/auth').authenticateToken,
  validate(schemas.userUpdate),
  async (req, res) => {
    try {
      const updatedUser = await User.update(req.user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          nom: updatedUser.nom,
          email: updatedUser.email,
          role: updatedUser.roleNom
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

// Update user profile details (telephone, adresse, etc.)
router.put('/profile/details',
  require('../middleware/auth').authenticateToken,
  async (req, res) => {
    try {
      const { telephone, adresse, avatarUrl, bio } = req.body;
      const updatedProfile = await User.updateProfile(req.user.id, {
        telephone,
        adresse,
        avatarUrl,
        bio
      });

      res.json({
        message: 'Profile details updated successfully',
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Profile details update error:', error);
      res.status(500).json({ error: 'Failed to update profile details' });
    }
  }
);

// Change password
router.put('/password',
  require('../middleware/auth').authenticateToken,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      // Get current user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await User.verifyPassword(currentPassword, user.motDePasse);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Update password
      await User.updatePassword(req.user.id, newPassword);

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

module.exports = router;
