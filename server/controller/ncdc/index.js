const {
  get
} = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');


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
  
    get('https://covid19.ncdc.gov.ng/')
      .then((response) => {
        const $ = cheerio.load(response.data);
  
        const totalTested = $('.pcoded-content').map(function () {
          const name = $(this).find('.page-block .card.newcol.order-card .card-body h6').text().trim();
          const countText = $(this).find('.page-block .card.newcol.order-card .card-body h2 span').text().trim();
  
          return {
            name,
            countText,
            countNumber: +countText.replace('>', '').replace(',', ''),
          }
        }).toArray();
  
        const summary = $('.pcoded-content .page-header .page-block + .row .card').map(function () {
          const name = $(this).find('.card-body h6').text().trim();
          const countText = $(this).find('.card-body h2 span').text().trim();
  
          return {
            name,
            countText,
            countNumber: Number(countText.replace(',', '')),
          }
        }).toArray();
  
        const stats = $('#custom1 > tbody > tr').map(function () {
          const state = $(this).find('td:nth-child(1)').text().trim();
          const numberOfCasesLabConfirmed = +$(this).find('td:nth-child(2)').text().trim().replace('>', '').replace(',', '');
          const numberOfCasesOnAdmission = +$(this).find('td:nth-child(3)').text().trim().replace('>', '').replace(',', '');
          const numberOfDischarged = +$(this).find('td:nth-child(4)').text().trim().replace('>', '').replace(',', '');
          const numberOfDeaths = +$(this).find('td:nth-child(5)').text().trim().replace('>', '').replace(',', '');
  
          return {
            state,
            numberOfCasesLabConfirmed: numberOfCasesLabConfirmed || (numberOfCasesOnAdmission + numberOfDischarged + numberOfDeaths),
            numberOfCasesOnAdmission,
            numberOfDischarged,
            numberOfDeaths,
          }
        }).toArray();
  
  
        const arrayTotal = [];
  
        stats.forEach(({
          numberOfCasesLabConfirmed,
          numberOfCasesOnAdmission,
          numberOfDischarged,
          numberOfDeaths,
        }) => {
          arrayTotal.push({
            numberOfCasesLabConfirmed,
            numberOfCasesOnAdmission,
            numberOfDischarged,
            numberOfDeaths,
          });
        })
  
        // format total stats
        const formattedTotal = {
          totalNumberOfCasesLabConfirmed: arrayTotal.reduce((accumulator, currentValue) => currentValue.numberOfCasesLabConfirmed + accumulator, 0),
          totalNumberOfCasesOnAdmission: arrayTotal.reduce((accumulator, currentValue) => currentValue.numberOfCasesOnAdmission + accumulator, 0),
          totalNumberOfDischarged: arrayTotal.reduce((accumulator, currentValue) => currentValue.numberOfDischarged + accumulator, 0),
          totalNumberOfDeaths: arrayTotal.reduce((accumulator, currentValue) => currentValue.numberOfDeaths + accumulator, 0),
          totalNumberOfStatesAffected: stats?.filter(({ state }) => state).length,
        }
  
        const data = {
          summary: [
            totalTested[0],
            ...summary,
          ],
          total: formattedTotal,
          statesCount: stats.filter(({ state }) => state).sort((stateA, stateB) => stateA?.state.toUpperCase() > stateB?.state.toUpperCase() ? 1 : -1),
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
