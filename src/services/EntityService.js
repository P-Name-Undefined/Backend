const EntityRepository = require("../repository/EntityRepository");
const UserRepository = require("../repository/UserRepository");
const firebase = require("../config/authFirebase");
const { ObjectID } = require("mongodb");
const { NotFoundError, BadRequestError } = require("../utils/errorHandler");

class EntityService {
  constructor() {
    this.entityRepository = new EntityRepository();
    this.userRepository = new UserRepository();
  }

  async createEntity(data) {
    const isUserRegistered = await this.userRepository.getUserByEmail(
      data.email
    );

    if (isUserRegistered) {
      throw new BadRequestError("Email já sendo utilizado");
    }

    if (data.password.length < 8) {
      throw new BadRequestError("Senha inválida");
    }

    if (data.cnpj.length >= 14) {
      data.cnpj = data.cnpj.replace(/([^0-9])+/g, "");
    }

    data.email = data.email.toLowerCase();
    try {
      const createdEntity = await this.entityRepository.create(data);

      if (!data.hasUser) {
        console.log("Usuario Criado");
        // Cria o usuário no firebase
        await firebase
          .auth()
          .createUser({
            email: data.email,
            password: data.password,
            displayName: `${data.name} | PJ`,
            emailVerified: false,
          })
          .catch(async (err) => {
            await this.removeEntity(data.email);
            throw err;
          });
      }

      return createdEntity;
    } catch (err) {
      throw err;
    }
  }

  async getEntity({ id = undefined, email = undefined }) {
    if (!id && !email) {
      throw new BadRequestError("Nenhum identificador encontrado");
    }
    let entity;

    if (id) {
      entity = await this.entityRepository.getById(id);
    } else {
      entity = await this.entityRepository.getEntityByEmail(email);
    }
    if (!entity) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return entity;
  }

  async editEntityById({
    email,
    photo,
    name,
    phone,
    notificationToken,
    deviceId,
  }) {
    const entity = await this.getEntity({ email });
    if(!entity) throw new NotFoundError("Usuário não encontrado");

    entity.photo = photo || entity.photo;
    entity.name = name || entity.name;
    entity.phone = phone || entity.phone;
    entity.notificationToken = notificationToken || entity.notificationToken;
    entity.deviceId = deviceId || entity.deviceId;

    const result = await this.entityRepository.update(entity);

    return result;
  }

  async editEntityAddressById({ email, cep, number, city, state, complement }) {
    const entity = await this.getEntity({ email });

    const address = {
      cep: cep || entity.address.cep,
      number: number || entity.address.number,
      city: city || entity.address.city,
      state: state || entity.address.state,
      complement: complement || entity.address.complement,
    };

    entity.address = address;

    const result = await this.entityRepository.update(entity);

    return result;
  }

  async updateEntityLocationById({ email, longitude, latitude }) {
    const entity = await this.getEntity({ email });

    if (longitude || latitude) {
      entity.location.coordinates[0] =
        longitude || entity.location.coordinates[0];
      entity.location.coordinates[1] =
        latitude || entity.location.coordinates[1];
    }

    const result = await this.entityRepository.update(entity);

    return result;
  }

  async deleteEntityLogically(email) {
    const entity = await this.getEntity({ email });

    entity.active = false;

    await this.entityRepository.update(entity);

    return { message: `Entity ${entity._id} deleted!` };
  }

  async removeEntity(email) {
    const entity = await this.getEntity({ email });
    await this.entityRepository.removeEntity({ id: entity._id, email });
  }

  async checkEntityExistence(entityIdentifier) {
    const result = await this.entityRepository.checkEntityExistence(
      entityIdentifier
    );

    if (result) {
      return true;
    }

    return false;
  }
  async findOneEntityWithProjection(entityId,projection){
    const query = { _id: ObjectID(entityId) };
    const entity = await this.entityRepository.findOneEntityWithProjection(query,projection);

    return entity;
  }
}

module.exports = EntityService;
