import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  changeCurrentPassword,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
  updateAccountDetails,
  updateAdminAvatar,
  updateAdminCoverImage,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAdminEvents } from "../controllers/event.controller.js";

const router = Router();

router.route("/login").post(upload.none(), loginAdmin);

// Secured routes
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-admin").get(verifyJWT, upload.none(), getCurrentAdmin);
router
  .route("/change-password")
  .post(verifyJWT, upload.none(), changeCurrentPassword);
router
  .route("/update-account-details")
  .post(verifyJWT, upload.none(), updateAccountDetails);
router
  .route("/update-cover-image")
  .post(verifyJWT, upload.single("coverImage"), updateAdminCoverImage);
router
  .route("/update-avatar")
  .post(verifyJWT, upload.single("avatar"), updateAdminAvatar);
router.route("/get-admin-events").get(verifyJWT, upload.none(), getAdminEvents);

export default router;
// Add Event routes that require admin access
// router.route("/create-event").post(verifyJWT, upload.none(), createEvent);
// router.route("/update-event/:id").post(verifyJWT, upload.none(), updateEvent);
// router.route("/delete-event/:id").post(verifyJWT, upload.none(), deleteEvent);
