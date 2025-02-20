import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEvent,
  initiateRegistration,
  registerEvent,
  updateEvent,
} from "../controllers/event.controller.js";

const router = Router();

router.route("/all-events").get(getAllEvents);
router.route("/event/:id").get(getEvent);
router.route("/register/initiate").post(upload.none(), initiateRegistration);
router.route("/register/verify").post(upload.none(), registerEvent);

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
