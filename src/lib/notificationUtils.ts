import { getUserProfile } from "./db";
import { createNotification } from "./notificationActions";
import type { NotificationType } from "@/types/notification";

export const createUserNotification = async ({
  type,
  userId,
  fromId,
  metadata = {}
}: {
  type: NotificationType;
  userId: string;
  fromId: string;
  metadata?: {
    messageId?: string;
  };
}) => {
  try {
    // Get the sender's profile for notification content
    const fromUser = await getUserProfile(fromId);
    if (!fromUser) return null;

    let title = "";
    let description = "";

    switch (type) {
      case "connection_request":
        title = `New connection request from ${fromUser.displayName}`;
        description = `${fromUser.displayName} wants to connect with you`;
        break;
      case "connection_accepted":
        title = `${fromUser.displayName} accepted your connection request`;
        description = `You are now connected with ${fromUser.displayName}`;
        break;
      case "message":
        title = `New message from ${fromUser.displayName}`;
        description = "You have a new message";
        break;
    }

    return await createNotification({
      type,
      userId,
      fromId,
      title,
      description,
      metadata
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
