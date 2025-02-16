import { validEmail } from "../helper/validators.js";
import { ApiError, ApiResponse, asyncHandler } from "../lib/utils.js";
import { Admin } from "../models/admin.model.js";
import { COOKIE_OPTIONS } from "../lib/constants.js";
import { generateAccessAndRefreshTokens } from "../lib/token.js";
import jwt from "jsonwebtoken";

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !validEmail(email)) {
    throw new ApiError(422, "Please enter a valid email address");
  }

  const admin = await Admin.findOne({ email });
  if (!admin) throw new ApiError(404, "Admin not found");
  if (!admin.isActive) throw new ApiError(403, "Admin is not active");
  if (admin.isDeleted) throw new ApiError(403, "Admin is deleted");

  const passwordMatched = await admin.isPasswordMatched(password);
  if (!passwordMatched) {
    admin.failedLoginAttempts += 1;
    await admin.save();
    throw new ApiError(401, "Incorrect password");
  }

  admin.lastLogin = new Date();
  admin.failedLoginAttempts = 0;
  await admin.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    admin._id
  );

  const loggedInAdmin = admin.toObject();
  delete loggedInAdmin.password;
  delete loggedInAdmin.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTIONS)
    .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        { user: loggedInAdmin, accessToken, refreshToken },
        "Admin logged in successfully"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );

  return res
    .clearCookie("accessToken", COOKIE_OPTIONS)
    .clearCookie("refreshToken", COOKIE_OPTIONS)
    .status(200)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decodedToken?.id).select("-password");

    if (!admin) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (admin.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(admin._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, COOKIE_OPTIONS)
      .cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { loginAdmin, logoutAdmin, refreshAccessToken };
