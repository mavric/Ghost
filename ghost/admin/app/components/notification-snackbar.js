import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class NotificationSnackbarComponent extends Component {
  @service firebase;

  constructor() {
    super(...arguments);
    this.firebase.onForegroundMessage((payload) => {
      console.log('Notification received in foreground:', payload);
      this.showNotification(payload.notification);
    });
  }

  showNotification(notification) {
    // Display notification in a user-friendly way (e.g., a snackbar)
    alert(`${notification.title}: ${notification.body}`);
  }
}
