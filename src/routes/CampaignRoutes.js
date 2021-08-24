const express = require('express');
const CampaignController = require('../controllers/CampaignController');
const isAuthenticated = require('../validation/middlewares/authFirebase');

const campaignController = new CampaignController();
const routes = express.Router();

routes.post('/campaign', isAuthenticated, (req, res, next) => {
  campaignController.createCampaign(req, res, next);
});

routes.get('/campaign', isAuthenticated, (req, res, next) => {
  campaignController.listCampaignNear(req, res, next);
});

routes.get(
  '/campaign/listbyStatus/:userId',
  isAuthenticated,
  (req, res, next) => {
    campaignController.getCampaignListByStatus(req, res, next);
  },
);
//Por que tem duas rotas de finishCampaign?
routes.put('/campaign/:id', isAuthenticated, (req, res, next) => {
  campaignController.finishCampaign(req, res, next);
});

routes.delete('/campaign/:id', isAuthenticated, async (req, res, next) => {
  campaignController.finishCampaign(req, res, next);
});
routes.get('/campaign/:id', isAuthenticated, (req, res, next) => {
  campaignController.getCampaignById(req, res, next);
});

module.exports = routes;
