const {
  Router
} = require('express');
const softcomRoute = require('./softcomRoutes');
const ncdcRoute = require('./ncdcRoutes');
const coronaVirusRoute = require('./coronaVirusRoutes');
const cronJobRouter = require('./cronJobRoutes');

const router = Router();

router.use(softcomRoute);
router.use(ncdcRoute);
router.use(coronaVirusRoute);
router.use(cronJobRouter);

module.exports = router;
