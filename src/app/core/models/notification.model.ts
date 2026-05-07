import { NotificationType } from './notification-type.enum';

export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface SendNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
}