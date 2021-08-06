const EntityService = require('../services/EntityService');
const saveError = require('../utils/ErrorHistory');

class EntityController {
  constructor() {
    this.entityService = new EntityService();
  }

  async createEntity(req, res) {
    const { latitude, longitude } = req.body;

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const data = {
      location,
      ...req.body,
      hasEntity: req.query.hasEntity === 'true',
    };

    const result = await this.entityService.createEntity(data);
    return res.status(201).json(result);
  }

  async editEntityById(req, res) {
    const data = {
      email: req.decodedToken.email,
      photo: req.body.photo,
      name: req.body.name,
      phone: req.body.phone,
      notificationToken: req.body.notificationToken,
      deviceId: req.body.deviceId,
    };
    const result = await this.entityService.editEntityById(data);
    return res.status(200).json(result);
  }

  async editEntityAddressById(req, res, next) {
    const data = {
      email: req.decodedToken.email,
      cep: req.body.cep,
      number: req.body.number,
      city: req.body.city,
      state: req.body.state,
      complement: req.body.complement,
    };

    const result = await this.entityService.editEntityAddressById(data);
    return res.status(200).json(result);
  }

  async deleteEntityLogic(req, res, next) {
    const { email } = req.decodedToken;

    const result = await this.entityService.deleteEntityLogically(email);
    return res.status(200).json(result);
  }

  async getEntityById(req, res, next) {
    const data = {
      id: req.params.id,
      email: req.decodedToken.email,
    };

    const result = await this.entityService.getEntity(data);
    return res.status(200).json(result);
  }

  async updateEntityLocationById(req, res, next) {
    const data = {
      email: req.decodedToken.email,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };

    const result = await this.entityService.updateEntityLocationById(data);
    return res.status(200).json(result);
  }

  async checkEntityExistence(req, res, next) {
    let { entityIdentifier } = req.params;

    if (!entityIdentifier) {
      entityIdentifier = req.decodedToken.email;
    }

    const result = await this.entityService.checkEntityExistence(entityIdentifier);
    return res.status(200).json(result);
  }
}

module.exports = EntityController;
