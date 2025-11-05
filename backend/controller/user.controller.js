import User from '../model/user.model.js';
import bcrypt from 'bcryptjs'; // for password hashing
import { OAuth2Client } from 'google-auth-library'; // example OAuth client
import Patient from '../model/patient.model.js';
import QRCode from "qrcode";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
 
    // Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    let qrCodeImage = null;

    if (user.role === "patient") {
      // 👇 Your local backend IP and port
      const baseURL = `http://192.168.0.202:8080`; // use your Wi-Fi IP, not localhost
      const qrURL = `${baseURL}/patient/${user._id}/records`;

      // Generate the QR code as base64 PNG
      qrCodeImage = await QRCode.toDataURL(qrURL);

      // Create patient record
      await Patient.create({
        user_id: user._id,
        qr_code: qrCodeImage,
      });
    }

    res.status(201).json({
      message: "User created successfully",
      user,
      qr_code: qrCodeImage, // frontend/Postman can show or download this
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================
// Create a new user manually
// ======================
// export const signup = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists.' });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({ 
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     //   res.status(201).json({ message: 'User created successfully', user });
//     //   if (user.role === 'patient') {
//     // await Patient.create({ user_id: user._id });
//     if (user.role === 'patient') {
//       await Patient.create({ user_id: user._id });
//     }

//     res.status(201).json({ message: 'User created successfully', user });
//   } catch (error) {
//   console.error(error);
//   res.status(500).json({ message: 'Server error' });
// }
// };


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

//     // Create new user
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     // If user is a patient, create patient record + QR
//     if (user.role === "patient") {
//       // generate unique URL to embed in QR
//       const qrDataURL = `${process.env.FRONTEND_URL || "https://your-domain.com"}/patient/${user._id}/records`;

//       // create QR code as base64 PNG
//       const qrCodeImage = await QRCode.toDataURL(qrDataURL);

//       await Patient.create({
//         user_id: user._id,
//         qr_code: qrCodeImage, // stored as base64
//       });
//     }

//     res.status(201).json({
//       message: "User created successfully",
//       user,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// ======================
// Signup endpoint
// ======================
// export const signup = async (req, res) => {
//   // For now, signup is same as createUser
//   await createUser(req, res);
// };

// ======================
// Signin endpoint
// ======================
// export const signin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     // For now, just return user info (later can add JWT / OAuth token)
//     res.status(200).json({ message: 'Signin successful', user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Return user info without sensitive data
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
      // Add other non-sensitive fields as needed
    };

    res.status(200).json({
      message: 'Signin successful',
      user: userResponse
    });

    // TODO: Add JWT token generation later
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    // res.status(200).json({ message: 'Signin successful', user: userResponse, token });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
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


// Get patient profile - returns patient_id
export const getPatientProfile = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Find patient by user_id
    const patient = await Patient.findOne({ user_id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Return the patient data
    res.json({
      patient_id: patient._id,
      user_id: patient.user_id,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.blood_group,
      qr_code: patient.qr_code,
      prescriptions: patient.prescriptions,
      reports: patient.reports,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// export const getPatientProfile = async (req, res) => {
//   try {
//     const { user_id } = req.params;

//     const patient = await Patient.findOne({ user_id })
//       .populate("visits.doctor_id", "name email");

//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }

//     // Return patient data with patient_id
//     res.json({
//       patient_id: patient._id,  // This is the unique patient ID
//       user_id: patient.user_id,
//       age: patient.age,
//       gender: patient.gender,
//       blood_group: patient.blood_group,
//       qr_code: patient.qr_code,
//       visits: patient.visits
//     });
//   } catch (error) {
//     console.error("Get profile error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };
