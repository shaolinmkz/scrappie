const {
  get
} = require('axios');
const cheerio = require('cheerio');
const fastArrayDiff = require('fast-array-diff');
const fs = require('fs');


const GetAvailableJobs = (req, res) => {
  try {
    const {
      fast
    } = req.query;
    const directory = 'server/controller/softcom';
    let sent = false;

    if ((fast === 'true') && fs.existsSync(`${directory}/softcom-jobs.json`)) {
      const oldJobsJson = fs.readFileSync(`${directory}/softcom-jobs.json`, 'utf8') || JSON.stringify([]);
      const oldJobs = JSON.parse(oldJobsJson);
      sent = true;
      res.status(200).json({
        status: true,
        message: 'available jobs at softcom',
        data: oldJobs,
      });
    }

    const SOFTCOM = 'https://softcom.ng/careers/openings/';
    get(SOFTCOM)
      .then(({
        data
      }) => {
        const $ = cheerio.load(data);

        const jobs = $('li.dashed-border').map(function () {
          const name = $(this).find('h4').text().trim().replace('\n               ', '');
          const link = $(this).find('a').attr('href');
          const location = $(this).find('h4 > span').text();

          return {
            name,
            location,
            link
          }
        }).toArray();

        // write to file
        fs.writeFileSync(`${directory}/softcom-jobs.json`, JSON.stringify(jobs, null, 2));

        if (fs.existsSync(`${directory}/softcom-jobs.json`)) {
          const oldJobsJson = fs.readFileSync(`${directory}/softcom-jobs.json`, 'utf8');
          const oldJobs = JSON.parse(oldJobsJson);

          const diff = fastArrayDiff.diff(oldJobs, jobs, (jobA, jobB) => {
            const xName = jobA.name === jobB.name;
            const xLocation = jobA.location === jobB.location;
            const xLink = jobA.link === jobB.link;
            return xName && xLocation && xLink;
          });

          if (diff.added.length > 0) {
            const softcomJobsAdded = diff.added.map(jobsAdded => jobsAdded);
            fs.writeFileSync(`${directory}/softcom-jobs-added.json`, JSON.stringify(softcomJobsAdded, null, 2));
          }

          if (diff.removed.length > 0) {
            const softcomJobsRemoved = diff.removed.map(jobsRemoved => jobsRemoved);
            fs.writeFileSync(`${directory}/softcom-jobs-removed.json`, JSON.stringify(softcomJobsRemoved, null, 2));
          }

        }
        if (!sent) {
          res.status(200).json({
            status: 200,
            data: jobs,
            added,
            removed,
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          status: 500,
          error: error?.response,
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
  GetAvailableJobs
}
