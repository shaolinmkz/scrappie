const { Router } = require('express');
const { getStatsOnCovid } = require('../controller/ncdc');

const ncdcRouter = Router();

ncdcRouter.get('/ncdc/covid-19-stats', getStatsOnCovid);

module.exports = ncdcRouter;
