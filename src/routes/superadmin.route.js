import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerAdmin } from "../controllers/superadmin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT, upload.none(), registerAdmin);

export default router;
