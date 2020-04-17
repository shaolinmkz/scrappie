const {
  get
} = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

export const scrapWorldMeter = ({ req, res, sent }) => {
  const worldoMeters = 'https://www.worldometers.info/coronavirus/';
  const savePath = 'server/controller/coronaVirus/covid19-world-stats.json';

  get(worldoMeters)
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


      if (!sent && res) {
        res.status(200).json({
          status: 200,
          method: req.method,
          message: 'successfully retrieved world stats for covid-19',
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

const getWorldStatsOnCovid = (req, res) => {

  try {
    const {
      fast
    } = req.query;

    let sent = false;
    const savePath = 'server/controller/coronaVirus/covid19-world-stats.json';
    if ((fast === 'true') && fs.existsSync(savePath)) {
      const oldCovidStatsJson = fs.readFileSync(savePath, 'utf8') || JSON.stringify({});
      const oldCovidStats = JSON.parse(oldCovidStatsJson);
      sent = true;
      res.status(200).json({
        status: true,
        message: 'successfully retrieved world stats for covid-19',
        data: oldCovidStats,
      });
    }

    scrapWorldMeter({req, res, sent});

  } catch (err) {
    res.status(500).json({
      status: 500,
      error: err,
    });
  }
};

module.exports = {
  getWorldStatsOnCovid
}
