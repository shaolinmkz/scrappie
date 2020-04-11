const {
  Router
} = require('express');
const softcomRoute = require('./softcomRoutes');
const ncdcRoute = require('./ncdcRoutes');
const coronaVirusRoute = require('./coronaVirusRoutes');

const router = Router();

router.use(softcomRoute);
router.use(ncdcRoute);
router.use(coronaVirusRoute);

module.exports = router;
