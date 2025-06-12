// Types of notifications
export type NotificationType = 'connection_request' | 'message' | 'connection_accepted' | 'recruitment';

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string; // user who should receive this notification
  fromId: string; // user who triggered this notification
  title: string;
  description: string;
  read: boolean;
  createdAt: Date | { toDate(): Date };
  metadata?: {
    messageId?: string;
  };
}
