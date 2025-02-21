import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  initiateEventRegistration,
  verifyEventRegistration,
  updateEvent,
  resendEventOTP,
} from "../controllers/event.controller.js";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../lib/redis.js";

const router = Router();

const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  message: "Too many OTP requests, please try again later.",
});

router.route("/all-events").get(getAllEvents);
router.route("/event/:id").get(getEvent);
router
  .route("/register/initiate")
  .post(upload.none(), otpRateLimiter, initiateEventRegistration);
router
  .route("/register/resend")
  .post(upload.none(), otpRateLimiter, resendEventOTP);
router.route("/register/verify").post(upload.none(), verifyEventRegistration);

router
  .route("/create-event")
  .post(
    verifyJWT,
    upload.fields([{ name: "photo", maxCount: 1 }]),
    createEvent
  );

router
  .route("/update-event/:id")
  .post(
    verifyJWT,
    upload.fields([{ name: "photo", maxCount: 1 }]),
    updateEvent
  );

router.route("/delete-event/:id").delete(verifyJWT, deleteEvent);

export default router;
