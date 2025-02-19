import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { v4 as uuidv4 } from 'uuid';

const eventSchema = new Schema(
  {
    photo: {
      type: String,
      required: [true, "Photo URL is required"],
      trim: true,
    },
    heading: {
      type: String,
      required: [true, "Heading is required"],
      trim: true,
    },
    subHeading: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["workshop", "event"],
        message: "Category must be either 'workshop' or 'event'",
      },
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    slug: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    society: {
      type: String,
      required: [true, "Society is required"],
      enum: {
        values: ["TechPath Finder", "Minded Peers"],
        message: "Society must be either 'Tech Path Finder' or 'Minded Peers'",
      },
    },
    dutyLeaveInfo: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model("Event", eventSchema);
