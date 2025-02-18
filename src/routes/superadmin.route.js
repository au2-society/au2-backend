import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  activateAdmin,
  changeAdminRole,
  deactivateAdmin,
  deleteAdmin,
  getAdminProfile,
  getAllAdminEvents,
  getAllAdmins,
  registerAdmin,
} from "../controllers/superadmin.controller.js";
import {
  requireSuperAdmin,
  verifyJWT,
} from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/register-admin")
  .post(verifyJWT, requireSuperAdmin, upload.none(), registerAdmin);

router.route("/all-admins").get(verifyJWT, requireSuperAdmin, getAllAdmins);

router.route("/admin/:id").get(verifyJWT, requireSuperAdmin, getAdminProfile);

router
  .route("/all-admins-events")
  .get(verifyJWT, requireSuperAdmin, getAllAdminEvents);

router
  .route("/delete-admin/:id")
  .delete(verifyJWT, requireSuperAdmin, deleteAdmin);

router
  .route("/change-admin-role/:id")
  .patch(verifyJWT, requireSuperAdmin, changeAdminRole);

router
  .route("/deactivate-admin/:id")
  .patch(verifyJWT, requireSuperAdmin, deactivateAdmin);

router
  .route("/activate-admin/:id")
  .patch(verifyJWT, requireSuperAdmin, activateAdmin);

export default router;
