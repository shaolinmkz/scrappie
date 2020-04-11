const {
  Router
} = require('express');
const softcomRoute = require('./softcom');
const ncdcRoute = require('./ncdc');

const router = Router();

router.use(softcomRoute);
router.use(ncdcRoute);

module.exports = router;
