const HelpOfferService = require("../services/HelpOfferService");
const saveError = require("../utils/ErrorHistory");

class OfferedHelpController {
  constructor() {
    this.HelpOfferService = new HelpOfferService();
  }

  async createHelpOffer(req, res) {
      const newHelpOffer = await this.HelpOfferService.createNewHelpOffer(
        req.body
      );
      return res.json(newHelpOffer);
  }

  async getHelpWithAggregationById(req, res) {
    const { id } = req.params;
    const result = await this.HelpOfferService.getHelpOfferWithAggregationById(id);
    return res.status(200).json(result);
  }

  async listHelpsOffers(req, res) {
    const userId = req.query.userId;
    const getOtherUsers = req.query.getOtherUsers == 'true' ? true : false;
    const helpOffers = await this.HelpOfferService.listHelpsOffers(userId, null,getOtherUsers);
    return res.json(helpOffers);
  }

  async listHelpOffersByHelpedUserId(req, res) {
    const { helpedUserId } = req.params;
    const helpOffers = await this.HelpOfferService.listHelpOffersByHelpedUserId(
      helpedUserId
    );
    return res.json(helpOffers);
  }

  async addPossibleHelpedUsers(req, res) {
    const { helpedId, helpOfferId } = req.params;
    await this.HelpOfferService.addPossibleHelpedUsers(helpedId, helpOfferId);
    return res.status(204).json();
  }

  async chooseHelpedUser(req, res) {}

  async finishHelpOfferByOwner(req, res) {
    const { helpOfferId } = req.params;
    const { email } = req.decodedToken;

    await this.HelpOfferService.finishHelpOfferByOwner(helpOfferId, email);
    return res.status(204).json();
  }
}

module.exports = OfferedHelpController;
