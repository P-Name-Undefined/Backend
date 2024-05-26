const config = {
  type: 'service_account',
  project_id: 'miaajuda-1b205',
  private_key_id: process.env.FIREBASE_CONFIG_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_CONFIG_PRIVATE_KEY,
  client_email: 'firebase-adminsdk-ee658@miaajuda-1b205.iam.gserviceaccount.com',
  client_id: '103236107628512014144',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ee658%40miaajuda-1b205.iam.gserviceaccount.com',
};

const databaseURL = 'https://miaajuda-1b205.firebaseio.com';

module.exports = {
  config,
  databaseURL,
};
