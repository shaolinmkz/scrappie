const {
  Router
} = require('express');
import {
  ncdcShedule,
  worldMeterSchedule,
} from '../controller/shedule';

const cronJobRouter = Router();

cronJobRouter.get('/ncdc/scrap',
(req, res) => {
  if(process.env.ACCESS !== req.query?.access) {
    res.status(403).json({
      message: 'you are forbidden to access this route',
    });
  } else if(req.query?.on === 'true') {
    ncdcShedule.start();
    res.status(200).json({
      on: true,
      method: res.method,
      message: 'Scrapping NCDC Turned ON',
    });
  } else {
    ncdcShedule.destroy();
    res.status(200).json({
      on: false,
      method: res.method,
      message: 'Scrapping NCDC Turned OFF',
    });
  }
});


cronJobRouter.get('/world-meter/scrap', 
(req, res) => {
  if(process.env.ACCESS !== req.query?.access) {
    res.status(403).json({
      message: 'you are forbidden to access this route',
    });
  } else if(req.query?.on === 'true') {
    worldMeterSchedule.start();
    res.status(204).json({
      start: true,
      method: req.method,
      message: 'Scrapping World Meter Turned ON',
    });
  } else {
    worldMeterSchedule.destroy();
    res.status(204).json({
      start: false,
      method: req.method,
      message: 'Scrapping World Meter Turned OFF',
    });
  }
});

module.exports = cronJobRouter;
