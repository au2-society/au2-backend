import crypto from "crypto";
import { extractUsername, validEmail } from "../helper/validators.js";
import { ApiError, ApiResponse, asyncHandler } from "../lib/utils.js";
import { Admin } from "../models/admin.model.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const isSuperAdmin = req.admin.role === "superadmin";

  if (!isSuperAdmin) {
    throw new ApiError(
      403,
      "You are not authorized to create an admin account"
    );
  }

  const { email } = req.body;

  const isValidEmail = validEmail(email);

  if (!email || !isValidEmail) {
    throw new ApiError(422, "Please enter a valid email address");
  }

  const existedAdmin = await Admin.findOne({ email });

  if (existedAdmin) {
    throw new ApiError(409, "Email already exists");
  }

  const defaultPassword = crypto.randomBytes(4).toString("hex");

  const username = extractUsername(email);

  const admin = await Admin.create({
    username: username.toLowerCase(),
    fullName: "",
    avatar: "",
    coverImage: "",
    email,
    password: defaultPassword,
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while creating admin");
  }

  // Send email with default password
  // await sendAdminEmail(email, defaultPassword);

  return res.status(201).json(
    new ApiResponse({
      statusCode: 200,
      success: true,
      message: "Admin registered successfully",
      data: createdAdmin,
    })
  );
});

export { registerAdmin };
