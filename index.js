require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const http = require('http');
const Sentry = require('@sentry/node');
const sentryInit = require('./src/config/sentryConfig');
const setRoutes = require('./src/routes/BaseRoutes');
const dailySchedule = require('./src/utils/schedule');
const { setupWebsocket } = require('./websocket');

const app = express();
sentryInit();
const server = http.Server(app);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
setupWebsocket(server);
const databaseConnect = require('./src/config/database');
const { errorHandler } = require('./src/utils/errorHandler');

app.use(cors());
app.use(bodyParser.json());

databaseConnect();
dailySchedule();
setRoutes(app);

app.use(errorHandler);
app.use(Sentry.Handlers.errorHandler());

server.listen(8000);
