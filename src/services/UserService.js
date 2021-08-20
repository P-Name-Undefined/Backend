const UserRepository = require("../repository/UserRepository");
const EntityRepository = require("../repository/EntityRepository");
const firebase = require("../config/authFirebase");
const { ObjectID } = require("mongodb");
const { ConflictError, BadRequestError, NotFoundError } = require("../utils/errorHandler");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.entityRepository = new EntityRepository();
  }

  async createUser(data) {
    const isEntityRegistered = await this.entityRepository.checkEntityExistence(
      data.email
    );

    if (isEntityRegistered) {
      throw new ConflictError("Email já sendo utilizado");
    }

    if (data.password.length < 8) {
      throw new BadRequestError("Senha inválida");
    }

    if (data.cpf.length >= 11) {
      data.cpf = data.cpf.replace(/[-.]/g, "");
    }

    data.email = data.email.toLowerCase();
    try {
      const createdUser = await this.userRepository.create(data);

      if (!data.hasUser) {
        // Cria o usuário no firebase
        await firebase
          .auth()
          .createUser({
            email: data.email,
            password: data.password,
            displayName: `${data.name} | PF`,
            emailVerified: false,
          })
          .catch(async (err) => {
            await this.removeUser(data.email);
            throw err;
          });
      }

      return createdUser;
    } catch (err) {
      throw err;
    }
  }

  async getUsersWithDevice() {
    try {
      const users = await this.userRepository.getUsersWithDevice();
      return users;
    } catch (err) {
      throw err;
    }
  }

  async getUser({ id = undefined, email = undefined }) {
    if (!id && !email) {
      throw new NotFoundError("Nenhum identificador encontrado");
    }
    let user;

    if (id) {
      user = await this.userRepository.getById(id);
    } else {
      user = await this.userRepository.getUserByEmail(email);
    }
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  }

  async getAnyUser({ id = undefined, email = undefined }) {
    if (!id && !email) {
      throw new NotFoundError("Nenhum identificador encontrado");
    }
    let user;

    if (id) {
      user = await this.userRepository.getById(id);
      if (!user) user = await this.entityRepository.getById(id);
    }
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  }

  async editUserById({
    email,
    photo,
    name,
    phone,
    notificationToken,
    deviceId,
  }) {
    const user = await this.getUser({ email });

    user.photo = photo || user.photo;
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.notificationToken = notificationToken || user.notificationToken;
    user.deviceId = deviceId || user.deviceId;

    const result = await this.userRepository.update(user);

    return result;
  }

  async editUserAddressById({ email, cep, number, city, state, complement }) {
    const user = await this.getUser({ email });

    const address = {
      cep: cep || user.address.cep,
      number: number || user.address.number,
      city: city || user.address.city,
      state: state || user.address.state,
      complement: complement || user.address.complement,
    };

    user.address = address;

    const result = await this.userRepository.update(user);

    return result;
  }

  async updateUserLocationById({ email, longitude, latitude }) {
    const user = await this.getUser({ email });

    if (longitude || latitude) {
      user.location.coordinates[0] = longitude || user.location.coordinates[0];
      user.location.coordinates[1] = latitude || user.location.coordinates[1];
    }

    const result = await this.userRepository.update(user);

    return result;
  }

  async deleteUserLogically(email) {
    const user = await this.getUser({ email });

    user.active = false;

    await this.userRepository.update(user);

    return { message: `User ${user._id} deleted!` };
  }

  async removeUser(email) {
    const user = await this.getUser({ email });
    await this.userRepository.removeUser({ id: user._id, email });
  }

  async checkUserExistence(userIdentifier) {
    const result = await this.userRepository.checkUserExistence(userIdentifier);

    if (result) {
      return true;
    }

    return false;
  }

  async findOneUserWithProjection(userId,projection){
    const query = { _id: ObjectID(userId) };
     
    const user = await this.userRepository.findOneUserWithProjection(query,projection);

    return user;
  }
}

module.exports = UserService;
