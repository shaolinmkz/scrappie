const {
  Router
} = require('express');
const {
  getWorldStatsOnCovid
} = require('../controller/coronaVirus');

const coronaVirusRouter = Router();

coronaVirusRouter.get('/corona-virus/world-stats', getWorldStatsOnCovid);

module.exports = coronaVirusRouter;
