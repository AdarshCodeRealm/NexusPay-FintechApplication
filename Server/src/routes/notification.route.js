import { Router } from "express";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { initializeDatabase } from "../middlewares/database.middleware.js";

const router = Router();

// Apply database initialization middleware first
router.use(initializeDatabase);

// All routes are protected
router.use(verifyJWT);

// Get all notifications for the authenticated user
router.route("/").get(getNotifications);

// Get unread notification count
router.route("/unread-count").get(getUnreadCount);

// Mark all notifications as read
router.route("/mark-all-read").patch(markAllNotificationsAsRead);

// Mark specific notification as read
router.route("/:notificationId/read").patch(markNotificationAsRead);

// Delete specific notification
router.route("/:notificationId").delete(deleteNotification);

export default router;