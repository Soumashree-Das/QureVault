import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Enum for user roles
const roles = ['patient', 'doctor'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
      required: true,
      default: 'patient',
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// Optional: Pre-save hook to hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

const User = model('User', userSchema);

export default User;
