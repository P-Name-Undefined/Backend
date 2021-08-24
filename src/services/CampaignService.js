const CampaignRepository = require('../repository/CampaignRepository');
const CategoryService = require('./CategoryService');
const helpStatusEnum = require('../utils/enums/helpStatusEnum');

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

  async getCampaignListByStatus({ userId, statusList }) {
    const checkHelpStatusExistence = statusList.filter(
      (item) => !Object.values(helpStatusEnum).includes(item),
    );

    if (checkHelpStatusExistence.length > 0) {
      throw new Error('Um dos status informados é ínvalido');
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
      throw new Error(
        'Nenhuma campanha foi encontrada no seu raio de distância',
      );
    }

    return CampaignList;
  }

  async getCampaignById(id) {
    const Campaign = await this.CampaignRepository.getById(id);

    if (!Campaign) {
      throw new Error('Campanha não encontrada');
    }

    return Campaign;
  }

  async finishCampaign(id) {
    const campaign = await this.getCampaignById(id);

    campaign.status = 'finished';

    const result = await this.CampaignRepository.update(campaign);
    return result;
  }
}

module.exports = CampaignService;
