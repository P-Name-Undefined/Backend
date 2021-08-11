const OfferedHelpRepository = require("../repository/HelpOfferRepository");
const UserService = require("./UserService");
const EntityService = require("./EntityService");
const NotificationService = require("./NotificationService");
const NotificationMixin = require("../utils/NotificationMixin");
const { notificationTypesEnum } = require("../models/Notification");
const saveError = require('../utils/ErrorHistory');
const { findConnections, sendMessage } = require("../../websocket");

class OfferedHelpService {
  constructor() {
    this.OfferedHelpRepository = new OfferedHelpRepository();
    this.UserService = new UserService();
    this.NotificationService = new NotificationService();
    this.NotificationMixin = new NotificationMixin();
    this.EntityService = new EntityService();
  }

  async createNewHelpOffer(offeredHelpInfo) {
    const newOfferdHelp = await this.OfferedHelpRepository.create(
      offeredHelpInfo
    );
    return newOfferdHelp;
  }

  async getHelpOfferWithAggregationById(id) {
    const help = await this.OfferedHelpRepository.getByIdWithAggregation(id);

    if (!help) {
      throw new Error('Oferta não encontrada');
    }

    return help;
  }

  async listHelpsOffers(userId, categoryArray, getOtherUsers) {
    const helpOffers = await this.OfferedHelpRepository.list(userId, categoryArray, getOtherUsers);
    return helpOffers;
  }

  async listHelpsOffersByOwnerId(ownerId) {
    const helpOffers = await this.OfferedHelpRepository.listByOwnerId(ownerId);
    return helpOffers;
  }

  async listHelpOffersByHelpedUserId(helpedUserId) {
    const helpOffers = await this.OfferedHelpRepository.listByHelpedUserId(
      helpedUserId
    );
    return helpOffers;
  }

  async addPossibleHelpedUsers(helpedId, helpOfferId) {
    const helpOffer = await this.getHelpOfferById(helpOfferId);
    let user, findOneUser, userPosition, possibleHelpedUser;

    if (isUserEntity) {
      userPosition = helpOffer.possibleEntities.indexOf(helpedId);
      user = this.EntityService;
      findOneUser = "findOneEntityWithProjection";
      possibleHelpedUser = helpOffer.possibleEntities;
    } else {
      userPosition = helpOffer.possibleHelpedUsers.indexOf(helpedId);
      user = this.UserService;
      findOneUser = "findOneUserWithProjection";
      possibleHelpedUser = helpOffer.possibleHelpedUsers;
    }

    if (helpOffer.ownerId == helpedId) {
      throw new Error("Usuário não pode ser ajudante da própria oferta");
    }
    else if (userPosition > -1) {
      throw new Error("Usuário já é um possível ajudado");
    }

    await this.useService(possibleHelpedUser, "push", [helpedId]);
    await this.OfferedHelpRepository.update(helpOffer);

    const helpedUserProjection = { name: 1, _id: 0 };
    const { name: helpedUserName } = await this.useService(user, findOneUser, [helpedId, helpedUserProjection]);

    const ownerProjection = { deviceId: 1, _id: 0 };
    const { deviceId: ownerDeviceId } = await this.useService(this.UserService, "findOneUserWithProjection", [helpOffer.ownerId, ownerProjection]);

    const title = `${helpedUserName} quer sua ajuda!`;
    const body = `Sua oferta ${helpOffer.title} recebeu um interessado`;

    const notificationHistory = {
      userId: helpOffer.ownerId,
      helpId: helpOffer._id,
      isOffer: true,
      title,
      body,
      notificationType: notificationTypesEnum.ofertaRequerida,
    };

    try {
      await this.NotificationMixin.sendNotification(
        ownerDeviceId,
        title,
        body
      );
      await this.NotificationService.createNotification(notificationHistory);
    } catch (err) {
      console.log("Não foi possível enviar a notificação!");
      saveError(err);
    }
  }

  async getHelpOfferById(helpOfferId) {
    const helpOffer = await this.OfferedHelpRepository.getById(helpOfferId);
    return helpOffer;
  }

  async finishHelpOfferByOwner(helpOfferId, email) {
    const helpOffer = await this.OfferedHelpRepository.finishHelpOfferByOwner(helpOfferId, email);
   
    const sendSocketMessageTo = findConnections(helpOffer.categoryId, helpOffer.ownerId.toString());
    sendMessage(sendSocketMessageTo, 'delete-help-offer', helpOfferId);
  }

  async getEmailByHelpOfferId(helpOfferId) {
    const ownerEmail = await this.OfferedHelpRepository.getEmailByHelpOfferId(helpOfferId);
    return ownerEmail;
  }

  async useService(service, functionName, params = []) {
    let functionReturn = await service[functionName](...params);
    return functionReturn;
  }
}

module.exports = OfferedHelpService;
