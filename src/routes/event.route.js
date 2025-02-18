import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createEvent, updateEvent } from "../controllers/event.controller.js";

const router = Router();

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

export default router;
