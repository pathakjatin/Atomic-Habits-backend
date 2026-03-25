// src/controllers/badge.controller.js
import { getUserBadges } from "../services/badge.service.js";

export async function getBadges(req, res, next) {
  try {
    const badges = await getUserBadges(req.user._id);
    return res.status(200).json({
      message: "Badges fetched successfully",
      data: badges,
    });
  } catch (error) {
    next(error);
  }
}