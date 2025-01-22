import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class NotificationService extends Service {
  @service ajax; // Ember's AJAX service or any HTTP library you use

  async sendNotification(tokens, title, body) {
    try {
      const response = await this.ajax.post('/send-notification', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens, title, body }),
      });
      console.log('Notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}
