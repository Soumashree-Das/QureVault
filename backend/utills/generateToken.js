import jwt from "jsonwebtoken";
import User from "../model/user.model.js";


/**
 * Generate Access & Refresh Tokens
 * @param {Object} user - Mongoose user document
 */
export const generateTokens = (user) => {
  if (!user?._id) {
    throw new Error("User object is required to generate tokens");
  }

  /* ===============================
     ACCESS TOKEN
     =============================== */
  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      tokenType: "access",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN, // 15m
    }
  );

  /* ===============================
     REFRESH TOKEN
     =============================== */
  const refreshToken = jwt.sign(
    {
      userId: user._id.toString(),
      tokenType: "refresh",
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN, // 7d
    }
  );

  return { accessToken, refreshToken };
};

// export const refreshAccessToken = async (req, res) => {
//   try {
//     const refreshToken =
//       req.body.refreshToken ||
//       req.headers["x-refresh-token"];

//     if (!refreshToken) {
//       return res.status(401).json({ message: "Refresh token required" });
//     }

//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     if (decoded.tokenType !== "refresh") {
//       return res.status(401).json({ message: "Invalid refresh token" });
//     }

//     const user = await User.findById(decoded.userId);
//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(401).json({ message: "Refresh token revoked" });
//     }

//     // 🔑 Issue NEW access token
//     const newAccessToken = jwt.sign(
//       {
//         userId: user._id.toString(),
//         role: user.role,
//         tokenType: "access",
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
//     );

//     res.status(200).json({ accessToken: newAccessToken });
//   } catch (error) {
//     console.error("Refresh error:", error);
//     return res.status(401).json({ message: "Invalid or expired refresh token" });
//   }
// };

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (decoded.tokenType !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        tokenType: "access",
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );  
    // console.log('newAccessToken', newAccessToken);
    // console.log('refreshToken', refreshToken);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error.message);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
