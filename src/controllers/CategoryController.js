const CategoryService = require('../services/CategoryService');
const { BadRequestError } = require('../utils/errorHandler');
const saveError = require('../utils/ErrorHistory');

class CategoryController {
  constructor() {
    this.CategoryService = new CategoryService();
  }

  async getCategoryById(req, res) {
    const { id } = req.params;
    if(!id) throw new BadRequestError('No id provided');
    const result = await this.CategoryService.getCategoryByid(id);
    return res.status(200).json(result);
  }

  async getCategoryList(req, res) {
    const id = req.query.id || null;
    const result = await this.CategoryService.getCategoryList(id);
    return res.status(200).json(result);
  }
}

module.exports = CategoryController;
