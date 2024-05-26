const config = {
  type: 'service_account',
  project_id: 'miaajudadev',
  private_key_id: process.env.FIREBASE_AUTH_CONFIG_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_AUTH_CONFIG_PRIVATE_KEY,
  client_email: 'firebase-adminsdk-1djmt@miaajudadev.iam.gserviceaccount.com',
  client_id: '105126767310578944074',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1djmt%40miaajudadev.iam.gserviceaccount.com',
};

const databaseURL = 'https://miaajudadev.firebaseio.com';

module.exports = {
  config,
  databaseURL,
};
