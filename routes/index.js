const { Router } = require('express');
const softcomRoute = require('./softcom');

const router = Router();

router.use(softcomRoute);

module.exports = router;
