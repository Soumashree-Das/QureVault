import express from 'express';
import {
  // createUser,
  getPatientProfile,
  signup,
  signin,
  signout,
  oauthSignin,
  forgotPassword
} from '../controller/user.controller.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { refreshAccessToken } from '../utills/generateToken.js';
import { limiter } from '../middleware/rateLimit.js';

const router = express.Router(); 

// ======================
// Routes for User
// ======================

// Signup endpoint
router.post('/signup', signup);

// Signin endpoint
router.post('/signin', limiter,  signin);

//forgot password
router.post("/forgot-password", limiter,forgotPassword);

// OAuth signin (Google example)
router.post('/oauth', oauthSignin);

router.get("/profile", verifyAccessToken,getPatientProfile);

router.post("/signout", verifyAccessToken, signout);

router.post("/refresh", refreshAccessToken);


export default router;
