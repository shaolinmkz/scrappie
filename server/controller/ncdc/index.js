const {
  get
} = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

export const scrapNcdc = ({ req, res, sent }) => {
  const NCDC = 'https://covid19.ncdc.gov.ng/';
  const savePath = 'server/controller/ncdc/covid-19-stats.json';

  get(NCDC)
    .then((response) => {
      const $ = cheerio.load(response.data);

      const summary = $('#custom1 > tbody > tr').map(function () {
        const name = $(this).find('td:nth-child(1)').text().trim();
        const countText = $(this).find('td:nth-child(2)').text().trim();

        return {
          name,
          countText,
          countNumber: +countText.replace('>', ''),
        }
      }).toArray();

      const stats = $('#custom3 > tbody > tr').map(function () {
        const state = $(this).find('td:nth-child(1)').text().trim();
        const numberOfCasesLabConfirmed = +$(this).find('td:nth-child(2)').text().trim();
        const numberOfCasesOnAdmission = +$(this).find('td:nth-child(3)').text().trim();
        const numberOfDischarged = +$(this).find('td:nth-child(4)').text().trim();
        const numberOfDeaths = +$(this).find('td:nth-child(5)').text().trim();

        return {
          state,
          numberOfCasesLabConfirmed: numberOfCasesLabConfirmed || (numberOfCasesOnAdmission + numberOfDischarged + numberOfDeaths),
          numberOfCasesOnAdmission,
          numberOfDischarged,
          numberOfDeaths,
        }
      }).toArray();

      // remove first entry
      stats.shift();

      // remove last entry
      const total = stats.pop();

      // format last entry to represent total states
      const formattedTotal = {
        totalNumberOfCasesLabConfirmed: +total.numberOfCasesLabConfirmed,
        totalNumberOfCasesOnAdmission: +total.numberOfCasesOnAdmission,
        totalNumberOfDischarged: +total.numberOfDischarged,
        totalNumberOfDeaths: +total.numberOfDeaths,
        totalNumberOfStatesAffected: stats.length,
      }

      const data = {
        summary,
        total: formattedTotal,
        statesCount: stats.sort((stateA, stateB) => stateA?.state.toUpperCase() > stateB?.state.toUpperCase() ? 1 : -1),
      }

      // write to file
      fs.writeFileSync(savePath, JSON.stringify(data, null, 2));


      if (!sent && res) {
        res.status(200).json({
          status: 200,
          method: req.method,
          message: 'covid-19 stats for Nigeria retrieved successfully',
          data
        });
      }
    })
    .catch(error => {
      if(res) res.status(500).json({
        status: 500,
        method: req.method,
        error: error?.message,
      });
    });
}

const getStatsOnCovid = (req, res) => {

  try {
    const {
      fast
    } = req.query;

    let sent = false;
    const savePath = 'server/controller/ncdc/covid-19-stats.json';
    if ((fast === 'true') && fs.existsSync(savePath)) {
      const oldCovidStatsJson = fs.readFileSync(savePath, 'utf8') || JSON.stringify({});
      const oldCovidStats = JSON.parse(oldCovidStatsJson);
      sent = true;
      res.status(200).json({
        status: true,
        message: 'covid-19 stats for Nigeria retrieved successfully',
        data: oldCovidStats,
      });
    }

    scrapNcdc({ req, res, sent });

  } catch (err) {
    res.status(500).json({
      status: 500,
      error: err,
    });
  }
}

module.exports = {
  getStatsOnCovid
}
