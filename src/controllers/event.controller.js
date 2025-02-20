import Event from "../models/event.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../lib/utils.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import redisClient from "../lib/redis.js";
import sendOTP from "../helper/sendOTP.js";
import { Participant } from "../models/participant.model.js";

const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .lean()
    .populate("owner", "fullName phoneNumber email")
    .exec();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        events,
        events.length ? "Events fetched successfully" : "No events available"
      )
    );
});

const initiateRegistration = asyncHandler(async (req, res) => {
  const { email, uid } = req.body;
  if (!email || !uid) {
    throw new ApiError(422, "Email and UID are required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`otp:${email}`, 300, otp);
  await sendOTP(email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

const registerEvent = asyncHandler(async (req, res) => {
  const {
    eventId,
    name,
    uid,
    sectionGroup,
    email,
    phoneNumber,
    academicUnit,
    academicYear,
    otp,
  } = req.body;

  if (
    !otp ||
    !eventId ||
    !name ||
    !uid ||
    !sectionGroup ||
    !email ||
    !phoneNumber ||
    !academicUnit ||
    !academicYear
  ) {
    throw new ApiError(422, "Missing required fields");
  }

  const storedOTP = await redisClient.get(`otp:${email}`);
  if (storedOTP !== otp) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  let participant = await Participant.findOne({ uid });
  if (!participant) {
    participant = await Participant.create({
      name,
      uid,
      email,
      sectionGroup,
      phoneNumber,
      academicUnit,
      academicYear,
    });
  }

  if (event.registeredUsers.includes(participant._id)) {
    throw new ApiError(400, "Already registered for this event");
  }

  event.registeredUsers.push(participant._id);
  await event.save();
  await redisClient.del(`otp:${email}`); 

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event registered successfully"));
});

const createEvent = asyncHandler(async (req, res) => {
  const {
    heading,
    subHeading,
    category,
    date,
    venue,
    time,
    description,
    society,
    dutyLeaveInfo,
  } = req.body;

  if (
    !heading ||
    !category ||
    !date ||
    !venue ||
    !time ||
    !description ||
    !society
  ) {
    throw new ApiError(422, "Missing required fields");
  }

  if (!req.files?.photo?.[0]?.path) {
    throw new ApiError(422, "Photo is required");
  }

  const photoPath = req.files.photo[0].path;
  const photo = await uploadOnCloudinary(photoPath);

  if (!photo) {
    throw new ApiError(500, "Error uploading photo");
  }

  const eventData = {
    photo: photo.url,
    heading,
    subHeading: subHeading || "",
    category,
    date,
    venue,
    time,
    description,
    society,
    dutyLeaveInfo: dutyLeaveInfo || "",
    owner: req.admin._id,
  };

  const event = await Event.create(eventData);

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.owner.toString() !== req.admin._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized: You can only update your own events"
    );
  }

  const updates = req.body;

  if (req.files?.photo) {
    const photoPath = req.files.photo[0]?.path;
    if (!photoPath) {
      throw new ApiError(422, "Photo upload failed");
    }
    const photo = await uploadOnCloudinary(photoPath);
    if (!photo) {
      throw new ApiError(422, "Error uploading photo");
    }
    updates.photo = photo.url;
  }

  Object.assign(event, updates);
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.owner.toString() !== req.admin._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized: You can only delete your own events"
    );
  }

  await Event.findByIdAndDelete(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Event deleted successfully"));
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).lean();

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event fetched successfully"));
});

export {
  createEvent,
  updateEvent,
  getAllEvents,
  deleteEvent,
  getEvent,
  registerEvent,
  initiateRegistration,
};
