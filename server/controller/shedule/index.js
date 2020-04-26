const cron = require('node-cron');
const {
  get
} = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const { log } = console;

export const worldMeterSchedule = cron.schedule('*/15 * * * *', () => { // */15
  const savePath = 'server/controller/coronaVirus/covid19-world-stats.json';

  get('https://www.worldometers.info/coronavirus/')
    .then((response) => {
      const $ = cheerio.load(response.data);

      const worldStat = $('#main_table_countries_today > tbody > tr').map(function () {
        const country = `${$(this).find('td:nth-child(1)').text()}`.trim() ||
        `${$(this).find('td:nth-child(1) > a').text()}`.trim() ||
        `${$(this).find('td:nth-child(1) > span').text()}`.trim();
        const totalCases = `${$(this).find('td:nth-child(2)').text()}`.trim();
        const newCases = `${$(this).find('td:nth-child(3)').text()}`.trim();
        const totalDeaths = `${$(this).find('td:nth-child(4)').text()}`.trim();
        const newDeaths = `${$(this).find('td:nth-child(5)').text()}`.trim();
        const totalRecovery = `${$(this).find('td:nth-child(6)').text()}`.trim();
        const activeCases = `${$(this).find('td:nth-child(7)').text()}`.trim();
        const seriousCritical = `${$(this).find('td:nth-child(8)').text()}`.trim();
        const totalCasesPer1mPop = `${$(this).find('td:nth-child(9)').text()}`.trim();
        const deathsPer1mPop = `${$(this).find('td:nth-child(10)').text()}`.trim();
        const totalTests = `${$(this).find('td:nth-child(11)').text()}`.trim();
        const testsPer1mPop = `${$(this).find('td:nth-child(12)').text()}`.trim();

        return {
          country,
          totalCases,
          newCases,
          totalDeaths,
          newDeaths,
          totalRecovery,
          activeCases,
          seriousCritical,
          totalCasesPer1mPop,
          deathsPer1mPop,
          totalTests,
          testsPer1mPop,
        }
      }).toArray();

      const worldTotal = worldStat.pop();

      let data = {
        worldTotal,
        worldStats: worldStat
        .filter(({ country }) => country && country.toLowerCase() !== 'total:')
        .sort((dataA, dataB) => dataA?.country.toUpperCase() > dataB?.country.toUpperCase() ? 1 : -1),
      }
      // write to file
      fs.writeFileSync(savePath, JSON.stringify(data, null, 2));
      log('==> scrapped world meter');
    }).catch(err => err);
});

export const ncdcShedule = cron.schedule('*/10 * * * *', () => { // *10

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
      }).toArray().filter(({ state }) => state);;

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
      log('==> scrapped ncdc');
}).catch(err => err);
});
