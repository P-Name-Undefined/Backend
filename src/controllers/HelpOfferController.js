const HelpOfferService = require("../services/HelpOfferService");
const saveError = require("../utils/ErrorHistory");

class OfferedHelpController {
  constructor() {
    this.HelpOfferService = new HelpOfferService();
  }

  async createHelpOffer(req, res) {
    try {
      const newHelpOffer = await this.HelpOfferService.createNewHelpOffer(
        req.body
      );
      return res.json(newHelpOffer);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getHelpWithAggregationById(req, res, next) {
    const { id } = req.params;

    try {
      const result = await this.HelpOfferService.getHelpOfferWithAggregationById(id);
      res.status(200).json(result);
      next();
    } catch (err) {
      saveError(err);
      res.status(400).send({ error: err.message });
      next();
    }
  }

  async listHelpsOffers(req, res) {
    const userId = req.query.userId;
    const getOtherUsers = req.query.getOtherUsers == 'true' ? true : false;
    try {
      const helpOffers = await this.HelpOfferService.listHelpsOffers(userId, null, getOtherUsers);
      return res.json(helpOffers);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async listHelpOffersByHelpedUserId(req, res) {
    const { helpedUserId } = req.params;
    try {
      const helpOffers = await this.HelpOfferService.listHelpOffersByHelpedUserId(
        helpedUserId
      );
      return res.json(helpOffers);
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  async addPossibleHelpedUsers(req, res) {
    const { helpedId, helpOfferId } = req.params;
    try {
      await this.HelpOfferService.addPossibleHelpedUsers(helpedId, helpOfferId);
      return res.status(204).json();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async chooseHelpedUsers(req, res) {
    const { helpedId, helpOfferId } = req.params;
    try {
      await this.HelpOfferService.addHelpedUsers(helpedId, helpOfferId);
      return res.status(204).json();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async finishHelpOfferByOwner(req, res) {
    const { helpOfferId } = req.params;
    const { email } = req.decodedToken;

    try {
      await this.HelpOfferService.finishHelpOfferByOwner(helpOfferId, email);
      return res.status(204).json();
    } catch (error) {
      saveError(error);
      return res.status(400).send({ error: error.message });
    }
  }
}

module.exports = OfferedHelpController;
