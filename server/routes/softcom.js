const {
  Router
} = require('express');
const {
  GetAvailableJobs
} = require('../controller/softcom');

const softcomRouter = Router();

softcomRouter.get('/softcom/jobs', GetAvailableJobs);

module.exports = softcomRouter;
