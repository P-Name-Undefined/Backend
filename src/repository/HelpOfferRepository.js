const { ObjectID } = require('mongodb');
const BaseRepository = require('./BaseRepository');
const OfferedHelp = require('../models/HelpOffer');

class OfferdHelpRepository extends BaseRepository {
  constructor() {
    super(OfferedHelp);
  }

  async create(offeredHelp) {
    const newOfferdHelp = await super.$save(offeredHelp);
    return newOfferdHelp;
  }

  async update(helpOffer) {
    await super.$update(helpOffer);
  }

  async getByIdWithAggregation(id) {
    const query = { _id: ObjectID(id) };
    const helpOfferFields = [
      '_id',
      'description',
      'title',
      'status',
      'ownerId',
      'categoryId',
      'possibleHelpedUsers',
      'possibleEntities',
      'helpedUserId'
    ];
    const user = {
      path: 'user',
      select: ['photo', 'phone', 'name', 'birthday', 'address.city']
    };
    const categories = {
      path: 'categories',
      select: ['_id', 'name']
    };
    const possibleHelpedUsers = {
      path: 'possibleHelpedUsers',
      select: ['_id', 'name', 'photo', 'birthday', 'phone', 'address.city']
    };
    const possibleEntities = {
      path: 'possibleEntities',
      select: ['_id', 'name', 'photo', 'birthday', 'address.city']
    };
    const helpedUsers = {
      path: 'helpedUsers',
      select: ['_id', 'name', 'photo', 'birthday', 'phone', 'address.city']
    };

    const populate = [user, categories, possibleHelpedUsers, possibleEntities, helpedUsers];
    return super.$findOne(query, helpOfferFields, populate);
  }

  async list(userId, categoryArray, getOtherUsers) {
    const matchQuery = this.getHelpOfferListQuery(
      userId,
      true,
      getOtherUsers,
      categoryArray
    );
    const helpOfferFields = ['_id', 'title', 'categoryId', 'ownerId'];
    const sort = { creationDate: -1 }
    const user = {
      path: 'user',
      select: ['name', 'address', 'birthday', 'location.coordinates']
    }

    const categories = 'categories';

    const possibleHelpedUsers = {
      path: 'possibleHelpedUsers',
      select: ['_id', 'name']
    };

    const possibleEntities = {
      path: 'possibleEntities',
      select: ['_id', 'name']
    };

    const helpedUsers = {
      path: 'helpedUserId',
      select: ['_id', 'name']
    };

    const populate = [user, categories, possibleHelpedUsers, possibleEntities, helpedUsers];

    return super.$list(matchQuery, helpOfferFields, populate, sort);
  }
  getHelpOfferListQuery(userId, active, getOtherUsers, categoryArray) {
    var matchQuery = { active };
    if (!getOtherUsers) {
      matchQuery.possibleHelpedUsers = { $not: { $in: [ObjectID(userId)] } };
      matchQuery.ownerId = { $ne: ObjectID(userId) };
    } else {
      matchQuery.ownerId = { $eq: ObjectID(userId) };
    }

    if (categoryArray) {
      matchQuery.categoryId = {
        $in: categoryArray.map((category) => ObjectID(category)),
      };
    }
    return matchQuery;
  }

  async listByOwnerId(ownerId) {
    const query = { ownerId };
    const helpOffers = await super.$list(query);
    return helpOffers;
  }

  async listByHelpedUserId(helpedUserId) {
    const query = { helpedUserId };
    const helpOffers = await super.$list(query);
    return helpOffers;
  }

  async getById(id) {
    const helpOffer = await super.$getById(id);
    return helpOffer;
  }

  async finishHelpOfferByOwner(helpOfferId) {
    const filter = { _id: helpOfferId };
    const update = { active: false };

    await super.$findOneAndUpdate(filter, update);
  }

  async getEmailByHelpOfferId(helpOfferId) {
    const matchQuery = { _id: ObjectID(helpOfferId) };
    const helpProjection = {
      _id: 0,
      ownerId: 1,
    }
    const user = {
      path: 'user',
      select: 'email -_id'
    }
    const helpOffer = await super.$findOne(matchQuery, helpProjection, user);
    return helpOffer.user.email;
  }
}

module.exports = OfferdHelpRepository;