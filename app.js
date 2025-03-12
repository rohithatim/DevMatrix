const express = require('express');
const connectDB = require('./config/database');
const User = require('./models/user');
const app = express();
const { validateSignUpData } = require('./utils/validation');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { userAuth } = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
  try {
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    const existingUser = await User.findOne({
      emailId,
    });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered',
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET || 'simplekey',
      {
        expiresIn: '24h',
      }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        userId: user._id,
        email: user.emailId,
        firstName: user.firstName,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already registered',
      });
    }
    console.error('Signup error:', err);
    res.status(400).json({
      status: 'error',
      message: err.message || 'Error creating user',
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    if (!req.body.emailId || !req.body.password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }
    const { emailId, password } = req.body;
    const user = await User.findOne({
      emailId,
    });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET || 'simplekey',
      {
        expiresIn: '24h',
      }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.emailId,
        firstName: user.firstName,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.get('/profile', userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/user', async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    const users = await User.findOne({
      emailId: userEmail,
    });
    if (users.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send('Something went wrong');
  }
});

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send('Something went wrong');
  }
});

app.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send('User deleted successfully');
  } catch (err) {
    res.status(400).send('Something went wrong');
  }
});

app.patch('/user', async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = ['photoUrl', 'about', 'gender', 'age'];
    const isUpdateAllowed = Object.keys(data).every((k) => {
      ALLOWED_UPDATES.includes(k);
    });
    if (!isUpdateAllowed) {
      throw new Error('Update not allowed');
    }
    if (data?.skills.length > 10) {
      throw new Error('Skills limit exceeded');
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: 'after',
      runValidators: true,
    });
    console.log(user);
    res.send('User updated successfully');
  } catch (err) {
    res.status(400).send('Something went wrong');
  }
});

app.listen(7777, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    return;
  }
  console.log('Server listening on port 7777');
});
