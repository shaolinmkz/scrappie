const { get } = require('axios');
const cheerio = require('cheerio');
const fastArrayDiff = require('fast-array-diff');
const fs = require('fs');

const GetAvailableJobs =  (req, res) => {
    const added = fs.existsSync('controller/softcom/softcom-jobs-added.json') ? JSON.parse(fs.readFileSync('controller/softcom/softcom-jobs-added.json', 'utf8')) : undefined;
    const removed = fs.existsSync('controller/softcom/softcom-jobs-removed.json') ? JSON.parse(fs.readFileSync('controller/softcom/softcom-jobs-removed.json', 'utf8')) : undefined;
    let sent = false;
    if(fs.existsSync('controller/softcom/softcom-jobs.json')) {
        const oldJobsJson = fs.readFileSync('controller/softcom/softcom-jobs.json', 'utf8');
        const oldJobs = JSON.parse(oldJobsJson);
        sent = true;
        res.status(200).json({
            status: true,
            message: 'available jobs at softcom',
            data: oldJobs,
            added,
            removed,
        });
    }

    get('https://softcom.ng/careers/openings/')
    .then(({ data }) => {
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
       fs.writeFileSync('controller/softcom/softcom-jobs.json', JSON.stringify(jobs, null, 2));
    
       if(fs.existsSync('controller/softcom/softcom-jobs.json')) {
        const oldJobsJson = fs.readFileSync('controller/softcom/softcom-jobs.json', 'utf8');
        const oldJobs = JSON.parse(oldJobsJson);
    
        const diff = fastArrayDiff.diff(oldJobs, jobs, (jobA, jobB) => {
             const xName = jobA.name === jobB.name;
             const xLocation = jobA.location === jobB.location;
             const xLink = jobA.link === jobB.link;
            return xName && xLocation && xLink;
        });
    
        if(diff.added.length > 0) {
            const softcomJobsAdded = diff.added.map(jobsAdded => jobsAdded);
            fs.writeFileSync('controller/softcom/softcom-jobs-added.json', JSON.stringify(softcomJobsAdded, null, 2));
        }
        
        if(diff.removed.length > 0) {
            const softcomJobsRemoved = diff.removed.map(jobsRemoved => jobsRemoved);
            fs.writeFileSync('controller/softcom/softcom-jobs-removed.json', JSON.stringify(softcomJobsRemoved, null, 2));
        }
    
    }
    if(!sent) {
        res.status(200).json({
            status: 200,
            data: jobs,
            added,
            removed,
        });
    }
    })
    .catch(error => console.error(error));
}

module.exports = { GetAvailableJobs }
