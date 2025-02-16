import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerAdmin } from "../controllers/superadmin.controller.js";

const router = Router();

// TODO: Add middleware to check superadmin
router.route("/register").post(upload.none(), registerAdmin);

export default router;
