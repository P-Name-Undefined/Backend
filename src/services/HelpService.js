const HelpRepository = require("../repository/HelpRepository");
const NotificationService = require("./NotificationService");
const { notificationTypesEnum } = require("../models/Notification");
const UserService = require("./UserService");
const EntityService = require("./EntityService");
const CategoryService = require("./CategoryService");
const { findConnections, sendMessage } = require("../../websocket");
const NotificationMixin = require("../utils/NotificationMixin");
const helpStatusEnum = require("../utils/enums/helpStatusEnum");
const saveError = require("../utils/ErrorHistory");
const { BadRequestError, NotFoundError, UnauthorizedError } = require("../utils/errorHandler");

class HelpService {
  constructor() {
    this.HelpRepository = new HelpRepository();
    this.UserService = new UserService();
    this.EntityService = new EntityService();
    this.CategoryService = new CategoryService();
    this.NotificationService = new NotificationService();
    this.NotificationMixin = new NotificationMixin();
  }

  async createHelp(data) {
    const countHelp = await this.HelpRepository.countDocuments(data.ownerId);
    if (countHelp >= 5) {
      throw new BadRequestError("Limite máximo de pedidos atingido");
    }

    await this.CategoryService.getCategoryByid(data.categoryId);

    const createdHelp = await this.HelpRepository.create(data);

    const sendSocketMessageTo = findConnections(
      createdHelp.categoryId,
      JSON.parse(JSON.stringify(createdHelp.ownerId))
    );
    sendMessage(sendSocketMessageTo, 'new-help', createdHelp);
  }

  async getHelpByid(id) {
    const Help = await this.HelpRepository.getById(id);

    if (!Help) {
      throw new NotFoundError("Ajuda não encontrada");
    }

    return Help;
  }


  async getHelpWithAggregationById(id) {
    const Help = await this.HelpRepository.getByIdWithAggregation(id);

    if (!Help) {
      throw new NotFoundError('Ajuda não encontrada');
    }

    return Help;
  }

  async getHelpList(coords, id, categoryArray) {
    const Helplist = await this.HelpRepository.shortList(
      coords,
      id,
      categoryArray
    );
    if (!Helplist) {
      throw new NotFoundError(
        "Pedidos de ajuda não encontrados no seu raio de distância"
      );
    }

    return Helplist;
  }

  async deleteHelpLogically(id) {
    let help = await this.getHelpByid(id);

    help.active = false;

    await this.HelpRepository.update(help);

    help = JSON.parse(JSON.stringify(help));
    const sendSocketMessageTo = findConnections(help.categoryId, JSON.parse(JSON.stringify(help.ownerId)));
    sendMessage(sendSocketMessageTo, 'delete-help', id);
  }

  async getHelpListByStatus({ userId, statusList, helper = false }) {
    const checkHelpStatusExistence = statusList.filter(
      (item) => !Object.values(helpStatusEnum).includes(item)
    );

    if (checkHelpStatusExistence.length > 0) {
      throw new BadRequestError("Um dos status informados é ínvalido");
    }

    const helpList = await this.HelpRepository.getHelpListByStatus(
      userId,
      statusList,
      helper
    );

    return helpList;
  }

  async chooseHelper(data) {
    const { idHelper } = data;
    const help = await this.getHelpByid(data.idHelp);
    const { ownerId } = help;
    let helper;
    try {
      helper = await this.UserService.getUser({ id: idHelper });
    } catch {
      helper = await this.EntityService.getEntity({ id: idHelper });
    }

    const owner = await this.UserService.getUser({ id: ownerId });

    if (help.helperId) {
      throw new BadRequestError("Ajuda já possui ajudante");
    }

    const sendSocketMessageTo = findConnections(
      help.categoryId,
      JSON.parse(JSON.stringify(ownerId))
    );
    sendMessage(sendSocketMessageTo, "delete-help", help._id);

    const title = `${owner.name} aceitou sua oferta de ajuda!`;
    const body = `Sua oferta para ${help.title} foi aceita`;

    const userPosition = help.possibleHelpers.indexOf(data.idHelper);
    const entityPosition = help.possibleEntities.indexOf(data.idHelper);
    if (userPosition < 0 && entityPosition < 0) {
      throw new NotFoundError('Ajudante não encontrado');
    } else {
      help.helperId = data.idHelper;
      help.status = "on_going";
      help.possibleHelpers = [];
      help.possibleEntities = [];
      await this.HelpRepository.update(help);

      const notificationHistory = {
        userId: helper._id,
        helpId: help._id,
        title,
        body,
        notificationType: notificationTypesEnum.ajudaAceita,
      };

      try {
        await this.NotificationService.createNotification(notificationHistory);
        await this.NotificationMixin.sendNotification(
          helper.deviceId,
          title,
          body
        );
      } catch (err) {
        console.log("Não foi possível enviar a notificação!");
        saveError(err);
      }
    }
  }

  async helperConfirmation(data) {
    const help = await this.getHelpByid(data.helpId);
    const owner = await this.UserService.getUser({ id: help.ownerId });
    let helper;
    try {
      helper = await this.UserService.getUser({ id: help.helperId });
    } catch {
      helper = await this.EntityService.getEntity({ id: help.helperId });
    }
    if (help.helperId != data.helperId) {
      throw new UnauthorizedError("Usuário não é o ajudante dessa ajuda");
    } else if (help.status === "owner_finished") {
      const ownerTitle = "Pedido de ajuda finalizado!";
      const ownerBody = `Seu pedido ${help.title} foi finalizado`;

      const ownerNotificationHistory = {
        userId: help.ownerId,
        helpId: help._id,
        title: ownerTitle,
        body: ownerBody,
        notificationType: notificationTypesEnum.ajudaFinalizada,
      };

      const helperTitle = "Oferta de ajuda finalizada!";
      const helperBody = `Sua oferta da ajuda ${help.title} foi finalizada`;
      const helperNotificationHistory = {
        userId: help.helperId,
        helpId: help._id,
        title: helperTitle,
        body: helperBody,
        notificationType: notificationTypesEnum.ajudaFinalizada,
      };

      try {
        await this.NotificationMixin.sendNotification(
          owner.deviceId,
          ownerTitle,
          ownerBody
        );
        await this.NotificationService.createNotification(
          ownerNotificationHistory
        );
        await this.NotificationMixin.sendNotification(
          helper.deviceId,
          helperTitle,
          helperBody
        );
        await this.NotificationService.createNotification(
          helperNotificationHistory
        );
      } catch (err) {
        console.log("Não foi possível enviar a notificação!");
        saveError(err);
      }

      help.status = "finished";
    } else if (help.status === "helper_finished") {
      throw new BadRequestError("Usuário já confirmou a finalização da ajuda");
    } else if (help.status === "finished") {
      throw new BadRequestError("Ajuda já foi finalizada");
    } else {
      help.status = "helper_finished";
    }

    await this.HelpRepository.update(help);
  }

  async ownerConfirmation(data) {
    const help = await this.getHelpByid(data.helpId);
    const owner = await this.UserService.getUser({ id: help.ownerId });
    let helper;
    try {
      helper = await this.UserService.getUser({ id: help.helperId });
    } catch {
      helper = await this.EntityService.getEntity({ id: help.helperId });
    }

    if (help.ownerId != data.ownerId) {
      throw new UnauthorizedError("Usuário não é o dono da ajuda");
    } else if (help.status === "helper_finished") {
      const ownerTitle = "Pedido de ajuda finalizado!";
      const ownerBody = `Seu pedido ${help.title} foi finalizado`;

      const ownerNotificationHistory = {
        userId: help.ownerId,
        helpId: help._id,
        title: ownerTitle,
        body: ownerBody,
        notificationType: notificationTypesEnum.ajudaFinalizada,
      };

      const helperTitle = "Oferta de ajuda finalizada!";
      const helperBody = `Sua oferta da ajuda ${help.title} foi finalizada`;
      const helperNotificationHistory = {
        userId: help.helperId,
        helpId: help._id,
        title: helperTitle,
        body: helperBody,
        notificationType: notificationTypesEnum.ajudaFinalizada,
      };

      try {
        await this.NotificationMixin.sendNotification(
          owner.deviceId,
          ownerTitle,
          ownerBody
        );
        await this.NotificationService.createNotification(
          ownerNotificationHistory
        );
        await this.NotificationMixin.sendNotification(
          helper.deviceId,
          helperTitle,
          helperBody
        );
        await this.NotificationService.createNotification(
          helperNotificationHistory
        );
      } catch (err) {
        console.log("Não foi possível enviar a notificação!");
        saveError(err);
      }

      help.status = "finished";
    } else if (help.status === "owner_finished") {
      throw new BadRequestError("Usuário já confirmou a finalização da ajuda");
    } else if (help.status === "finished") {
      throw new BadRequestError("Essa ajuda já foi finalizada");
    } else {
      help.status = "owner_finished";
    }

    await this.HelpRepository.update(help);
  }

  async addPossibleHelpers(id, idHelper) {
    const help = await this.getHelpByid(id);
    const owner = await this.UserService.getUser({ id: help.ownerId });
    if (idHelper == help.ownerId) {
      throw new BadRequestError("Você não pode ser ajudante de sua própria ajuda");
    }
    if (help.helperId) {
      throw new BadRequestError("Ajuda já possui ajudante");
    }
    let helper;
    let isUser = false;
    try {
      helper = await this.UserService.getUser({ id: idHelper });
      isUser = true;
    } catch {
      helper = await this.EntityService.getEntity({ id: idHelper });
    }
    if (isUser) {
      const userPosition = help.possibleHelpers.indexOf(idHelper);

      if (userPosition > -1) {
        throw new BadRequestError("Usuário já é um possível ajudante");
      }

      help.possibleHelpers.push(idHelper);
    } else {
      const userPosition = help.possibleEntities.indexOf(idHelper);

      if (userPosition > -1) {
        throw new BadRequestError("Usuário já é um possível ajudante");
      }

      help.possibleEntities.push(idHelper);
    }

    await this.HelpRepository.update(help);

    const title = `${helper.name} quer te ajudar!`;
    const body = `Seu pedido ${help.title} recebeu uma oferta de ajuda`;

    const notificationHistory = {
      userId: help.ownerId,
      helpId: help._id,
      title,
      body,
      notificationType: notificationTypesEnum.ajudaRecebida,
    };

    try {
      await this.NotificationMixin.sendNotification(
        owner.deviceId,
        title,
        body
      );
      await this.NotificationService.createNotification(notificationHistory);
    } catch (err) {
      console.log("Não foi possível enviar a notificação!");
      saveError(err);
    }
  }

  async getListToDelete() {
    const Helplist = await this.HelpRepository.listToExpire();
    if (!Helplist) {
      throw new NotFoundError("Pedidos de ajuda não encontrados");
    }

    return Helplist;
  }

  async getHelpInfoById(helpId) {
    const helpInfo = await this.HelpRepository.getHelpInfoById(helpId);
    if (!helpInfo) {
      throw new NotFoundError('Pedido de ajuda não encontrado');
    }
    return helpInfo;
  }
}

module.exports = HelpService;
