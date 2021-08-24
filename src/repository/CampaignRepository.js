const { ObjectID } = require('mongodb');
const BaseRepository = require('./BaseRepository');
const Campaign = require('../models/Campaign');
const EntitySchema = require('../models/Entity');

class CampaignRepository extends BaseRepository {
  constructor() {
    super(Campaign);
  }

  async create(campaign) {
    const newCampaign = await super.$save(campaign);
    return newCampaign;
  }
  
  async getById(id) {
    const campaign = await super.$getById(id);
    return campaign;
  }

  async update(campaign) {
    await super.$update(campaign);
  }

  async listNear(coords, except, id, categoryArray) {
    const userQuery = {
      _id: except ? { $ne: id } : null,
    };
    const users = await EntitySchema.find(userQuery);
    const arrayUsersId = users.map((user) => user._id);
    const matchQuery = {
      active: true,
      ownerId: { $in: arrayUsersId },
      status: 'waiting'
    };
    const populate = ['entity', 'categories'];

    if (categoryArray) {
      matchQuery.categoryId = {
        $in: categoryArray.map((categoryString) => ObjectID(categoryString)),
      };
    }

    const campaigns = await super.$list(matchQuery, {}, populate);
    const campaignsWithDistances = campaigns.map(campaign => {
      campaign.distances = { campaignCoords: campaign.entity.location.coordinates, coords }
      return campaign.toObject();
    })

    campaignsWithDistances.sort((a, b) => a.distanceValue - b.distanceValue);

    return campaignsWithDistances;
  }

  async getCampaignListByStatus(userId, statusList) {
    const matchQuery = {
      ownerId: ObjectID(userId),
      status: {
        $in: [...statusList],
      },
      active: true,
    };
    const entity = 'entity';
    const categories = 'categories';
    return super.$list(matchQuery, {}, [entity, categories]);
  }
}

module.exports = CampaignRepository;
