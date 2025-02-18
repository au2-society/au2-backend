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

export default router;
