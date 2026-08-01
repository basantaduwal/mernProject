import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * User Schema definition
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      // Password is only required for standard login (not Google login)
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Only indexes documents with a googleId field (prevents duplicate null errors)
    },
    role: {
      type: String,
      enum: ['Admin', 'Customer'],
      default: 'Customer',
    },
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving if it has been modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
