const CampaignRepository = require('../repository/CampaignRepository');
const CategoryService = require('./CategoryService');
const helpStatusEnum = require('../utils/enums/helpStatusEnum');
const { BadRequestError, NotFoundError } = require('../utils/errorHandler');

class CampaignService {
  constructor() {
    this.CampaignRepository = new CampaignRepository();
    this.CategoryService = new CategoryService();
  }

  async createNewCampaign(campaignInfo) {
    await this.CategoryService.getCategoryByid(campaignInfo.categoryId);
    const newCampaign = await this.CampaignRepository.create(campaignInfo);
    return newCampaign;
  }

  async listCampaign() {
    const campaign = await this.CampaignRepository.list();
    return campaign;
  }

  async getCampaignListByStatus({ userId, statusList }) {
    const checkHelpStatusExistence = statusList.filter(
      (item) => !Object.values(helpStatusEnum).includes(item),
    );

    if (checkHelpStatusExistence.length > 0) {
      throw new BadRequestError('Um dos status informados é ínvalido');
    }

    const helpList = await this.CampaignRepository.getCampaignListByStatus(
      userId,
      statusList,
    );

    return helpList;
  }

  async getNearCampaignList(coords, except, id, categoryArray) {
    const CampaignList = await this.CampaignRepository.listNear(
      coords,
      except,
      id,
      categoryArray,
    );
    if (!CampaignList) {
      throw new NotFoundError(
        'Nenhuma campanha foi encontrada no seu raio de distância',
      );
    }

    return CampaignList;
  }

  async getCampaignById(id) {
    const Campaign = await this.CampaignRepository.getById(id);

    if (!Campaign) {
      throw new NotFoundError('Campanha não encontrada');
    }

    return Campaign;
  }

  async deleteCampaign(id) {
    let campaign = await this.getCampaignById(id);
    console.log(campaign);
    campaign.active = false;

    await this.CampaignRepository.update(campaign);
    

    campaign = JSON.parse(JSON.stringify(campaign));
    return { message: `Campaign ${id} deleted!` };
  }

  async listCampaignByOwnerId(ownerId) {
    const campaign = await this.CampaignRepository.listByOwnerId(ownerId);
    return campaign;
  }

  async finishCampaign(id) {
    const campaign = await this.getCampaignById(id);

    campaign.status = 'finished';

    const result = await this.CampaignRepository.update(campaign);
    return result;
  }
}

module.exports = CampaignService;
