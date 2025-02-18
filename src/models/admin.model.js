import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const adminSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          // Validates emails like: random.e15358@cumail.in
          return /^[a-zA-Z0-9_.+-]+\.e\d+@cumail\.in$/i.test(value);
        },
        message: (props) => `${props.value} is not a valid university email!`,
      },
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "superadmin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual populate: get all events where this admin is the owner
adminSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "owner",
});

// Ensure virtuals are included when converting to JSON or Object
adminSchema.set("toObject", { virtuals: true });
adminSchema.set("toJSON", { virtuals: true });

// Hash password before saving the admin document.
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare entered password with stored hashed password.
adminSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT access token.
adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id.toString(),
      fullName: this.fullName,
      role: this.role,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate JWT refresh token.
adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Helper method to activate an admin.
adminSchema.methods.activate = function () {
  this.isActive = true;
  return this.save();
};

// Helper method to deactivate an admin.
adminSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

export const Admin = mongoose.model("Admin", adminSchema);
