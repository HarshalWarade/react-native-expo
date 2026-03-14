import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  syncUser,
  updateProfile,
} from "../controllers/user.controller.js";

import { protectRoute } from "../middleware/authentication.middleware.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile);

// update profile => authenticated
router.put("/profile", protectRoute, updateProfile);
router.get("/me", protectRoute, getCurrentUser);
router.post("/sync", protectRoute, syncUser);
router.post("/follow/:targetUserId", protectRoute, followUser);

export default router;
