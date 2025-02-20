import { validEmail } from "../helper/validators.js";
import { ApiError, ApiResponse, asyncHandler } from "../lib/utils.js";
import { Admin } from "../models/admin.model.js";
import { COOKIE_OPTIONS } from "../lib/constants.js";
import { generateAccessAndRefreshTokens } from "../lib/token.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
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
        { admin: loggedInAdmin, accessToken, refreshToken },
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
    .clearCookie("accessToken", { ...COOKIE_OPTIONS, maxAge: 0 })
    .clearCookie("refreshToken", { ...COOKIE_OPTIONS, maxAge: 0 })
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

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin?.id);
  const isPasswordCorrect = await admin.isPasswordMatched(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect password");
  }

  admin.password = newPassword;
  await admin.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  console.log("Get current admin", req.admin);
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.admin, "Current Admin fetched successfully")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, phoneNumber, bio } = req.body;

  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (bio) updateFields.bio = bio;

  const admin = await Admin.findByIdAndUpdate(
    req.admin?.id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Account details updated successfully"));
});

const updateAdminAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(422, "Avatar upload failed");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(422, "Error uploading avatar");
  }

  const admin = await Admin.findByIdAndUpdate(
    req.admin?.id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Avatar updated successfully"));
});

const updateAdminCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(422, "Cover image upload failed");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(422, "Error uploading cover image");
  }

  const admin = await Admin.findByIdAndUpdate(
    req.admin?.id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Cover image updated successfully"));
});

export {
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentAdmin,
  updateAccountDetails,
  updateAdminAvatar,
  updateAdminCoverImage,
};
