const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  card_number: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  valid_thru: {
    type: String,
    required: true,
    trim: true
  },
  CCV2: {
    type: String,
    required: true,
    trim: true
  },
  balance: {
    type: String,
    required: true,
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;