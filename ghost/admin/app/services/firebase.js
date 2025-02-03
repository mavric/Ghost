import Service from '@ember/service';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export default class FirebaseService extends Service {
  messaging = null;

  initializeFirebase(config) {
    const app = initializeApp(config);
    this.messaging = getMessaging(app);
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await this.getToken();
        console.log('FCM Token:', token);
        return token;
      } else {
        console.warn('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  async getToken() {
    try {
      const token = await getToken(this.messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      return token;
    } catch (error) {
      console.error('Error retrieving FCM token:', error);
    }
  }

  onForegroundMessage(callback) {
    onMessage(this.messaging, callback);
  }
}
