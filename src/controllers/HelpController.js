const HelpService = require("../services/HelpService");

class HelpController {
  constructor() {
    this.HelpService = new HelpService();
  }

  async createHelp(req, res, next) {
    const data = {
      ...req.body,
    };

    try {
      const result = await this.HelpService.createHelp(data);
      res.status(201).json(result);
      next();
    } catch (err) {
      res.status(400).send({ error: err });
      next();
    }
  }

  async getHelpById(req, res, next) {
    const { id } = req.params;
    try {
      const result = await this.HelpService.getHelpByid(id);
      res.status(200).json(result);
      next();
    } catch (err) {
      res.status(400).json({ error: err });
      next();
    }
  }

  async getHelpList(req, res, next) {
    const except = !!req.query["id.except"];
    const helper = !!req.query["id.helper"];
    const temp = except ? "except" : helper ? "helper" : null;
    const id = temp ? req.query[`id.${temp}`] : req.query.id;
    const status = req.query.status || null;
    const categoryArray = req.query.categoryId
      ? req.query.categoryId.split(",")
      : null;
    /* A requisição do Query é feita com o formato "34312ID12312,12312ID13213",
         sendo que não é aceito o formato "34312ID12312, 12312ID13213" com espaço */

    const near = !!req.query.near;
    const coords = near
      ? req.query.coords.split(",").map((coord) => Number(coord))
      : null;

    try {
      let result;

      if (near) {
        result = await this.HelpService.getNearHelpList(
          coords,
          except,
          id,
          categoryArray
        );
      } else {
        result = await this.HelpService.getHelpList(
          id,
          status,
          except,
          helper,
          categoryArray
        );
      }
      res.status(200);
      res.json(result);
      next();
    } catch (err) {
      res.status(400).json({ error: err });
      next();
    }
  }

  async deleteHelpLogic(req, res, next) {
    const { id } = req.params;

    try {
      const result = await this.HelpService.deleteHelpLogically(id);
      res.status(200).json(result);
      return next();
    } catch (err) {
      res.status(400).json(err);
      return next();
    }
  }
}

module.exports = HelpController;
