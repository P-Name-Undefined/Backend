const NotificationService = require('../services/NotificationService');
const saveError = require('../utils/ErrorHistory');

class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  async getUserNotificationsById(req, res, next) {
    const { id } = req.params;

    const result = await this.notificationService.getUserNotificationsById(id);
    return res.status(200).json(result);
  }

  async sendNotifications(req, res, next) {
    const { title, body } = req.body;
    const result = await this.notificationService.createAndSendNotifications(title, body);
    return res.status(200).json(result);
  }
}

module.exports = NotificationController;
