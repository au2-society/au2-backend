import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const adminSchema = new Schema(
  {
    fullName: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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
    },
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
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

// Hash password before saving the user document
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with stored hashed password
adminSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT access token
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

// Generate JWT refresh token
adminSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Admin = mongoose.model("Admin", adminSchema);
