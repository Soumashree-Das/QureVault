import User from '../model/user.model.js';
import bcrypt from 'bcryptjs'; // for password hashing
import { OAuth2Client } from 'google-auth-library'; // example OAuth client
import Patient from '../model/patient.model.js';
import QRCode from "qrcode";


// //v2
// export const signup = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists." });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create the new user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     let qrCodeImage = null;

//     if (user.role === "patient") {
//       const frontendURL = "https://qurevault-ver1.netlify.app";
//       // const frontendURL = "http://192.168.0.202:8081";
//       // ✅ Include user_id as a parameter in the URL
//       const qrURL = `${frontendURL}/ReportsPage?user_id=${user._id}`;

//       // Generate the QR code as base64 PNG
//       qrCodeImage = await QRCode.toDataURL(qrURL);

//       // Create patient record
//       await Patient.create({
//         user_id: user._id,
//         qr_code: qrCodeImage,
//         name: user.name,
//       });
//     }

//     res.status(201).json({
//       message: "User created successfully",
//       user,
//       qr_code: qrCodeImage,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// signup controller
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    let qrCodeImage = null;

    if (user.role === "patient") {
      // const frontendURL = "http://192.168.0.202:8081";
      const frontendURL = "https://qurevault-ver1.netlify.app";
      const qrURL = `${frontendURL}/reportspage?user_id=${user._id}`;
      qrCodeImage = await QRCode.toDataURL(qrURL);

      // ✅ ALWAYS store name in Patient
      await Patient.create({
        user_id: user._id,
        name: user.name,
        qr_code: qrCodeImage,
      });
    }

    res.status(201).json({
      message: "User created successfully",
      user,
      qr_code: qrCodeImage,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ======================
// Signin endpoint
// ======================
// v2
import { generateTokens } from '../utills/generateToken.js';

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token (recommended)
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: "Signin successful",
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

 
// ======================
// signout
// ======================
export const signout = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove refresh token from DB
    await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: "" } },
      { new: true }
    );

    return res.status(200).json({
      message: "Signed out successfully",
    });

  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Example OAuth (Google) signin
// ======================
export const oauthSignin = async (req, res) => {
  try {
    const { tokenId } = req.body; // tokenId sent from frontend after Google login
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if not exists
      user = await User.create({ name, email, password: '', role: 'patient' });
    }

    // Return user info (can later add OAuth token / JWT)
    res.status(200).json({ message: 'OAuth signin successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'OAuth signin failed' });
  }
};
// ======================
// Forgot Password
// ======================
// // User clicks "Forgot Password"
// //         ↓
// // Enters email + new password
// //         ↓
// // Backend verifies user exists
// //         ↓
// // Hashes new password
// //         ↓
// // Password updated

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};


// Get patient profile - returns patient_id

// // v1 -> without jwt
// export const getPatientProfile = async (req, res) => {
//   try {
//     const { user_id } = req.params;

//     // Find patient by user_id
//     const patient = await Patient.findOne({ user_id });

//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     // Return the patient data
//     res.json({
//       patient_id: patient._id,
//       user_id: patient.user_id,
//       age: patient.age,
//       gender: patient.gender,
//       blood_group: patient.blood_group,
//       qr_code: patient.qr_code,
//       prescriptions: patient.prescriptions,
//       reports: patient.reports,
//     });
//   } catch (error) {
//     console.error("Get profile error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// v2
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // 👈 from JWT

    const patient = await Patient.findOne({ user_id: userId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      patient_id: patient._id,
      user_id: patient.user_id,
      name:patient.name,
      age:patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group,
      qr_code: patient.qr_code,
      prescriptions: patient.prescriptions,
      reports: patient.reports,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
