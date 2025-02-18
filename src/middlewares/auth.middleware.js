import jwt from "jsonwebtoken";
import { asyncHandler, ApiError } from "../lib/utils.js";
import { Admin } from "../models/admin.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid access token");
    }

    const admin = await Admin.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    if (!admin) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const requireSuperAdmin = (req, _, next) => {
  if (req.admin && req.admin.role === "superadmin") {
    return next();
  }
  throw new ApiError(403, "Access denied. Super admin only.");
};
