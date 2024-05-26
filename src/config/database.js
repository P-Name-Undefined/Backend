const mongoose = require('mongoose');
const CategorySeed = require('../utils/seed/CategorySeed');
const UserSeed = require('../utils/seed/UserSeed');
const HelpSeed = require('../utils/seed/HelpOfferCampaignSeed');
const NotificationSeed = require('../utils/seed/NotificationSeed');
const BadgeSeed = require('../utils/seed/BadgeTemplateSeed');

const databaseURL = process.env.DATABASE_URL || 'mongodb://mongo:27017/miaAjudaDB';
const envType = process.env.NODE_ENV || 'development';

const databaseConnect = async () => {
  try {
    await mongoose.connect(databaseURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Banco de dados conectado!');
    mongoose.set('useFindAndModify', false);

    await CategorySeed();
    // só popula usuários e ajudas falsos em desenvolvimento
    if (envType === 'development') {
      await UserSeed();
      await HelpSeed();
      // await NotificationSeed();
      // await BadgeSeed();
    }
  } catch (err) {
    console.log('Não foi possível inicicializar corretamente a base de dados!');
    console.log(err);
  }
};

module.exports = databaseConnect;
