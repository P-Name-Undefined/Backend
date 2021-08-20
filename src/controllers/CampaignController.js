const CampaignService = require('../services/CampaignService');
const { UnauthorizedError, BadRequestError } = require('../utils/errorHandler');
const saveError = require('../utils/ErrorHistory');

class CampaignController {
  constructor() {
    this.CampaignService = new CampaignService();
  }

  async createCampaign(req, res) {
    const newCampaign = await this.CampaignService.createNewCampaign(
      req.body,
    );
    return res.json(newCampaign);
  }

  async listCampaign(req, res) {
    const campaign = await this.CampaignService.listCampaign();
    return res.json(campaign);
  }

  async getCampaignListByStatus(req, res) {
    const { userId } = req.params;

    const statusList = req.query.statusList.split(',');

    const result = await this.CampaignService.getCampaignListByStatus({
      userId,
      statusList,
    });
    return res.status(200).json(result);
  }

  async listCampaignByOwnerId(req, res) {
    const { ownerId } = req.params;
    if(!ownerId) throw new UnauthorizedError('No ownerId provided');
    const campaign = await this.CampaignService.listCampaignByOwnerId(
      ownerId,
    );
    return res.json(campaign);
  }

  async deleteCampaignLogic(req, res) {
    const { id } = req.params;
    if(!id) throw new BadRequestError('No id provided');
    const result = await this.CampaignService.deleteCampaign(id);
    res.status(200).json(result);
  }

  async listCampaignNear(req, res) {
    const except = !!req.query['id.except'];
    const helper = !!req.query['id.helper'];
    let temp = null;
    if (except) {
      temp = 'except';
    } else if (helper) {
      temp = 'helper';
    }

    const id = temp ? req.query[`id.${temp}`] : req.query.id;
    const categoryArray = req.query.categoryId
      ? req.query.categoryId.split(',')
      : null;

    const near = !!req.query.near;
    const coords = near
      ? req.query.coords.split(',').map((coord) => Number(coord))
      : null;

    let result;
    if (near) {
      result = await this.CampaignService.getNearCampaignList(
        coords,
        except,
        id,
        categoryArray,
      );
    }
    return res.status(200).json(result);
  }

  async finishCampaign(req, res) {
    if(!id) throw new BadRequestError('No id provided');
    const result = await this.CampaignService.finishCampaign(id);
    return res.status(200).json(result);
  }

  async getCampaignById(req, res) {
    const { id } = req.params;
    if(!id) throw new BadRequestError('No id provided')
    const result = await this.CampaignService.getCampaignById(id);
    return res.status(200).json(result);
  }
}

module.exports = CampaignController;
