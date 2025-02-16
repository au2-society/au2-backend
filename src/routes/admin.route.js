import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  loginAdmin,
  logoutAdmin,
  refreshAccessToken,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(upload.none(), loginAdmin);

// Secured routes
router.route("/logout").post(verifyJWT, logoutAdmin);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
