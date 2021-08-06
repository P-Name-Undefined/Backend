const CategoryRepository = require('../repository/CategoryRepository');
const { NotFoundError } = require('../utils/errorHandler');

class CategoryService {
  constructor() {
    this.CategoryRepository = new CategoryRepository();
  }

  // TODO: Querys parecem idênticas
  async getCategoryByid(id) {
    const Category = await this.CategoryRepository.getById(id);

    if (!Category) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return Category;
  }

  async getCategoryList(id) {
    const Categorylist = await this.CategoryRepository.list(id);
    if (!Categorylist) {
      throw new NotFoundError('Categoria não encontrada');
    }

    return Categorylist;
  }
}

module.exports = CategoryService;
