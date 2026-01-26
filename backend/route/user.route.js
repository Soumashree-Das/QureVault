import express from 'express';
import {
  // createUser,
  getPatientProfile,
  signup,
  signin,
  oauthSignin,
  forgotPassword
} from '../controller/user.controller.js';

const router = express.Router();

// ======================
// Routes for User
// ======================

// Signup endpoint
router.post('/signup', signup);

// Signin endpoint
router.post('/signin', signin);

//forgot password
router.post("/forgot-password", forgotPassword);

// OAuth signin (Google example)
router.post('/oauth', oauthSignin);

router.get("/profile/:user_id", getPatientProfile);

export default router;
