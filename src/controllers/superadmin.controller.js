import crypto from "crypto";
import { extractUsername, validEmail } from "../helper/validators.js";
import { ApiError, ApiResponse, asyncHandler } from "../lib/utils.js";
import { Admin } from "../models/admin.model.js";
import sendWelcomeEmail from "../helper/sendRegisterAdminEmail.js";

const registerAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validEmail(email)) {
    throw new ApiError(422, "Please enter a valid email address");
  }

  const existedAdmin = await Admin.findOne({ email });
  if (existedAdmin) {
    throw new ApiError(409, "Email already exists");
  }

  const defaultPassword = crypto.randomBytes(4).toString("hex");
  const username = extractUsername(email);

  let admin;
  try {
    admin = await Admin.create({
      username: username.toLowerCase(),
      fullName: "",
      avatar: "",
      coverImage: "",
      email,
      password: defaultPassword,
    });
  } catch (error) {
    throw new ApiError(500, "Error creating admin");
  }

  const createdAdmin = await Admin.findById(admin._id)
    .select("-password -refreshToken")
    .lean();

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while creating admin");
  }

  try {
    await sendWelcomeEmail(email, username, defaultPassword);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin registered successfully"));
});

const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({ role: "admin" })
    .select("-password -refreshToken")
    .lean();

  if (!admins.length) {
    throw new ApiError(404, "No admins found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admins, "Admins fetched successfully"));
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  await Admin.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: new Date(),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin deleted successfully"));
});

const deactivateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  await Admin.findByIdAndUpdate(id, { isActive: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin deactivated successfully"));
});

const activateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  await Admin.findByIdAndUpdate(id, { isActive: true });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin activated successfully"));
});

const changeAdminRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ["admin", "superadmin"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  admin.role = role;
  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin role changed successfully"));
});

const getAllAdminEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().lean();

  if (!events.length) {
    throw new ApiError(404, "No events found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});

const getAdminProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await Admin.findById(id);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, admin, "Admin profile fetched successfully"));
});

export {
  registerAdmin,
  getAllAdmins,
  deleteAdmin,
  deactivateAdmin,
  activateAdmin,
  changeAdminRole,
  getAllAdminEvents,
  getAdminProfile,
};
