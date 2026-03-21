import { clerkClient, getAuth } from "@clerk/express";
import asyncHandler from "express-async-handler";

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

const generateUsername = (email) => {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}_${suffix}`;
};

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, {
    new: true,
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const syncUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const existingUser = await User.findOne({ clerkId: userId });

  if (existingUser)
    return res
      .status(200)
      .json({ user: existingUser, message: "User already exists" });

  const clerkUser = await clerkClient.users.getUser(userId);

  const email = clerkUser.emailAddresses[0].emailAddress;

  const userData = {
    clerkId: userId,
    email,
    firstName: clerkUser.firstName || "",
    lastName: clerkUser.lastName || " ", // Google OAuth often returns null — space avoids required validation
    username: generateUsername(email),
    profilePicture: clerkUser.imageUrl || "",
  };

  try {
    const user = await User.create(userData);
    return res.status(201).json({ user, message: "User created successfully" });
  } catch (err) {
    // Last-resort fallback: if username still collides (astronomically rare),
    // retry once with a fresh suffix before giving up.
    if (err.code === 11000 && err.keyPattern?.username) {
      userData.username = generateUsername(email);
      const user = await User.create(userData);
      return res.status(201).json({ user, message: "User created successfully" });
    }
    throw err;
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(401).json({ error: "User not found" });

  res.status(200).json({ user });
});

export const followUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { targetUserId } = req.params;

  if (userId === targetUserId)
    return res.status(400).json({ error: "You cannot follow yourself" });

  const currentUser = await User.findOne({ clerkId: userId });
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser)
    return res.status(404).json({ error: "User not found" });

  const isFollowing = currentUser.followings.includes(targetUserId);

  if (isFollowing) {
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { followings: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser._id },
    });
  } else {
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { followings: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUser._id },
    });

    await Notification.create({
      from: currentUser._id,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing
      ? "User unfollowed successfully"
      : "User followed successfully",
  });
});
