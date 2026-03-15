import express from "express";
import {
  getNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/authentication.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;
