import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          // Basic email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    sectionGroup: {
      type: String,
      trim: true,
      default: "",
    },
    academicUnit: {
      type: String,
      trim: true,
      default: "",
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    academicYear: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Participant = mongoose.model("Participant", participantSchema);
