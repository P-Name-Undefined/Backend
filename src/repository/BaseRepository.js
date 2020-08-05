const mongoose = require('mongoose');

class BaseRepository {
  constructor(modelClass) {
    this.modelClass = modelClass;
  }

  async $save(dataModel, mongoSession = {}) {
    if (dataModel._id) {
      dataModel.lastUpdateDate = Date.now();
    }
    const savedModel = await new this.modelClass(dataModel).save({
      session: mongoSession.session,
    });
    return savedModel;
  }

  async $saveMany(itemsModel, mongoSession = {}) {
    itemsModel.forEach((item) => {
      item.lastUpdateDate = Date.now();
    });
    const savedModels = await this.modelClass.insertMany(itemsModel, {
      session: mongoSession.session,
    });
    return savedModels;
  }

  async $update(dataModel, mongoSession = {}) {
    dataModel.lastUpdateDate = Date.now();
    const savedModel = await dataModel.save({ session: mongoSession.session });
    return savedModel;
  }

  async $listAggregate(aggregationPipeline) {
    const aggregatedPipeline = await this.modelClass.aggregate(aggregationPipeline).exec();
    return aggregatedPipeline;
  }

  /**
   * @param {string} id Id do objeto
   * @param {Boolean} [active = true] se vou pegar ou não elementos deletados,
   * Se for false, mesmo elementos removidos serão exibidos.
   */
  async $getById(id, active = true) {
    let finalIdFormat = id;

    if (typeof id === 'string') {
      try {
        finalIdFormat = mongoose.Types.ObjectId(id);
      } catch (err) {
        throw new Error('Tamanho ou formato de id inválido');
      }
    }

    const query = {
      _id: finalIdFormat,
    };

    if (active) {
      query.active = true;
    }

    const recordModel = await this.modelClass.findOne(query);

    return recordModel;
  }

  async $list(query,selectedField,populate = null) {
    console.log(query);
    const recordModel = await this.modelClass.find(query, selectedField).populate(populate);
    return recordModel;
  }

  async $countDocuments(query) {
    const numberDocuments = await this.modelClass.countDocuments(query);
    return numberDocuments;
  }

  async findOne(query, mongoSession = {}) {
    let result;

    if (mongoSession !== undefined || mongoSession.session !== undefined) {
      result = await this.modelClass
        .findOne(query)
        .session(mongoSession.session);
      return result;
    }
    result = await this.modelClass.findOne(query);

    return result;
  }

  async $destroy(query) {
    const result = await this.modelClass.deleteOne(query);
    return result;
  }
}

module.exports = BaseRepository;
