import express from "express";
import {
  createComment,
  getComments,
  deleteComment,
} from "../controllers/comment.controller.js";
import { protectRoute } from "../middleware/authentication.middleware.js";

const router = express.Router();

router.get("/post/:postId", getComments);

router.post("/post/:postId", protectRoute, createComment);
router.delete("/:commentId", protectRoute, deleteComment);

export default router;
