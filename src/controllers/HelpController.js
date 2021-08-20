const HelpService = require('../services/HelpService');
const UserService = require('../services/UserService');
const saveError = require('../utils/ErrorHistory');

class HelpController {
  constructor() {
    this.HelpService = new HelpService();
    this.UserService = new UserService();
  }

  async createHelp(req, res) {
    const data = {
      ...req.body,
    };

    await this.HelpService.createHelp(data);
    return res.status(201).send();
  }

  async getHelpWithAggregationById(req, res) {
    const { id } = req.params;

    const result = await this.HelpService.getHelpWithAggregationById(id);
    return res.status(200).json(result);
  }

  async getHelpList(req, res) {
    const { id } = req.query;
    const coords = req.query.coords.split(',').map((coord) => Number(coord));
    const categoryArray = req.query.categoryId ? req.query.categoryId.split(',') : null;
    /* A requisição do Query é feita com o formato "34312ID12312,12312ID13213",
            sendo que não é aceito o formato "34312ID12312, 12312ID13213" com espaço */
    const result = await this.HelpService.getHelpList(
      coords,
      id,
      categoryArray,
    );
    return res.status(200).json(result);
  }

  async getHelpListByStatus(req, res) {
    const { userId } = req.params;

    /* A lista de status deve vir numa query  separada por vírgulas
         * Ex.: (...)?statusList=on_going,finished
         */
    const statusList = req.query.statusList.split(',');

    // Por padrão é feito uma agregação procurando por um ownerId.
    // Caso queira procurar por um helperId é necessário uma query
    const helper = req.query.helper === 'true';

    const result = await this.HelpService.getHelpListByStatus({ userId, statusList, helper });
    return res.status(200).json(result);
  }

  async deleteHelpLogic(req, res) {
    const { id } = req.params;
    await this.HelpService.deleteHelpLogically(id);
    return res.status(204).send();
  }

  async helperConfirmation(req, res) {    
    const data = { ...req.params };
    await this.HelpService.helperConfirmation(data);
    return res.status(204).send();
  }

  async ownerConfirmation(req, res) {
    const data = { ...req.params };
    await this.HelpService.ownerConfirmation(data);
    return res.status(204).send();
  }

  async chooseHelper(req, res) {
    const data = { ...req.params };
    await this.HelpService.chooseHelper(data);
    return res.status(204).json();
  }

  async addPossibleHelpers(req, res) {
    const id = req.params.idHelp;
    const { idHelper } = req.params;
    await this.HelpService.addPossibleHelpers(id, idHelper);
    return res.status(204).send();
  }

  async getToExpireList(req, res) {
    const result = await this.HelpService.getListToDelete();
    return res.status(200).json(result);
  }

  async getHelpInfoById(req, res) {
    const { helpId } = req.params;
    const result = await this.HelpService.getHelpInfoById(helpId);
    return res.status(200).json(result);
  }

}

module.exports = HelpController;
