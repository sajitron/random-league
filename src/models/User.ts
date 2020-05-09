import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    default: 'https://res.cloudinary.com/sajicode/image/upload/v1549973773/avatar.png',
  },
  role: {
    type: String,
    default: 'user',
  },
  password: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('users', userSchema);
