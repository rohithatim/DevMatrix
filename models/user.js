const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 4,
    maxlength: 50,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    min: 18,
  },
  gender: {
    type: String,
    validate(value) {
      if (!['male', 'female', 'others'].includes(value)) {
        throw new Error('Gender must be male, female or others');
      }
    },
  },

  photoUrl: {
    type: String,
  },

  about: {
    type: String,
    default: 'default about of user',
  },
  skills: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
