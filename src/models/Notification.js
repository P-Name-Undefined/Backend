const mongoose = require('mongoose');

const notificationTypes = {
  ajudaRecebida: 'Seu pedido recebeu uma oferta de ajuda!',
  ajudaAceita: 'Sua oferta de ajuda foi aceita!',
  ajudaFinalizada: 'Seu pedido de ajuda foi finalizado!',
  ajudaExpirada: 'Seu pedido de ajuda expirou!',
  ofertaRequerida: 'Sua oferta de ajuda possui um usuário interessado!',
  ofertaAceita: 'Seu pedido de ajuda foi aceito!',
  outros: 'Demais tipos de notificação!',
};

const notificationTypesEnum = {
  ajudaRecebida: 'ajudaRecebida',
  ajudaAceita: 'ajudaAceita',
  ajudaFinalizada: 'ajudaFinalizada',
  ajudaExpirada: 'ajudaExpirada',
  notificacaoManual: 'notificacaoManual',
  ofertaRequerida: 'ofertaRequerida',
  ofertaAceita: 'ofertaAceita',
  outros: 'outros',
};

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  isOffer: {
    type: Boolean,
    required: false,
    default: false,
  },
  helpId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Help',
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  registerDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notificationType: {
    type: String,
    enum: [...Object.keys(notificationTypesEnum)],
  },
}, {
  collection: 'notification',
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
  Notification,
  notificationTypes,
  notificationTypesEnum,
};
