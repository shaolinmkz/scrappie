const {
  Router
} = require('express');
const softcomRoute = require('./softcomRoutes');
const ncdcRoute = require('./ncdcRoutes');
const coronaVirusWorldRoute = require('./coronaVirusRoutes');

const router = Router();

router.use(softcomRoute);
router.use(ncdcRoute);
router.use(coronaVirusWorldRoute);

module.exports = router;
