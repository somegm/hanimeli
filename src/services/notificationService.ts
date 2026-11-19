import Constants from 'expo-constants';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;

function isNotificationsSupported(): boolean {
  // Expo Go on Android (SDK 53+) no longer supports expo-notifications.
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    return false;
  }
  return true;
}

async function getNotifications(): Promise<NotificationsModule | null> {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  if (!isNotificationsSupported()) {
    notificationsModule = null;
    return null;
  }

  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notificationsModule = Notifications;
    return Notifications;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return null;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId: String(projectId) } : undefined,
    );
    return tokenData.data;
  } catch {
    return null;
  }
}

export async function schedulePriceDropAlert(
  productName: string,
  newPrice: number,
  storeName: string,
): Promise<string | null> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return null;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Fiyat Düştü!',
        body: `${productName} ${storeName}'da ${newPrice.toFixed(2)} ₺'ye düştü.`,
        sound: true,
      },
      trigger: null,
    });

    return notificationId;
  } catch {
    return null;
  }
}
