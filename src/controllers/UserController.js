const UserService = require("../services/UserService");
const { riskGroups } = require("../models/RiskGroup");
const saveError = require("../utils/ErrorHistory");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async createUser(req, res, next) {
    const { latitude, longitude } = req.body;

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    const data = {
      location,
      ...req.body,
      hasUser: req.query.hasUser === "true",
    };

    const result = await this.userService.createUser(data);
    return res.status(201).json(result);
  }

  async editUserById(req, res, next) {
    const data = {
      email: req.decodedToken.email,
      photo: req.body.photo,
      name: req.body.name,
      phone: req.body.phone,
      notificationToken: req.body.notificationToken,
      deviceId: req.body.deviceId,
    };
    const result = await this.userService.editUserById(data);
    return res.status(200).json(result);
  }

  async editUserAddressById(req, res, next) {
    const data = {
      email: req.decodedToken.email,
      cep: req.body.cep,
      number: req.body.number,
      city: req.body.city,
      state: req.body.state,
      complement: req.body.complement,
    };

    const result = await this.userService.editUserAddressById(data);
    return res.status(200).json(result);
  }

  async deleteUserLogic(req, res) {
    const { email } = req.decodedToken;

    const result = await this.userService.deleteUserLogically(email);
    return res.status(200).json(result);
  }

  async getUserById(req, res) {
    const data = {
      id: req.params.id,
      email: req.decodedToken.email,
    };
    const result = await this.userService.getUser(data);
    return res.status(200).json(result);
  }

  async getAnyUserById(req, res) {
    const data = {
      id: req.params.id,
    };
    
    const result = await this.userService.getAnyUser(data);
    return res.status(200).json(result);
  }

  async updateUserLocationById(req, res) {
    const data = {
      email: req.decodedToken.email,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };

    const result = await this.userService.updateUserLocationById(data);
    return res.status(200).json(result);
  }

  async checkUserExistence(req, res) {
    let { userIdentifier } = req.params;

    if (!userIdentifier) {
      userIdentifier = req.decodedToken.email;
    }

    const result = await this.userService.checkUserExistence(userIdentifier);
    return res.status(200).json(result);
  }

  async getUserGroupRiskList(req, res) {
    return res.status(200).json(riskGroups);
  }
}

module.exports = UserController;
