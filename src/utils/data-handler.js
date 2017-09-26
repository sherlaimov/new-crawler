import fetch from 'node-fetch';
import PubSub from '../emitter';
import config from '../config';
import db from '../database/loki';

// db.loadDatabase({}, err => {
//   if (err) {
//     console.log(`Error loading DB : ${err}`);
//   } else {
//     console.log('database loaded.');
//     statsCollector('https://scotch.io/');
//   }
// });

const ITERATION_TOTAL = 5;
// const crawler = new Crawler();

// crawler.on('data-received', dataHandler);
PubSub.on('data-received', dataHandler);

function visitPage(url) {
  const start = new Date().getTime();
  return fetch(url)
    .then(resp => resp.text())
    .then(body => {
      const reqTime = new Date().getTime() - start;
      return {
        url,
        time: reqTime,
        size: body.length,
      };
    })
    .catch(err => {
      console.log(err);
      console.log('Status code: ' + resp.status);
      console.log(`An error has occurred \n code: ${error.code}`);
    });
}

function dataHandler(url) {
  console.log('***=> INSIDE DATAHANDLER <=***');
  const pages = db.getCollection(url).find();
  const pagesColl = db.getCollection(url);
  const promises = [];

  pages.forEach(page => {
    for (let i = 0; i < ITERATION_TOTAL; i += 1) {
      promises.push(visitPage(page.url));
    }
  });

  Promise.all(promises)
    .then(results => {
      pagesColl.insert(results);
    })
    .then(() => {
      console.log('*** starting statsCollector ****');
      return statsCollector(url);
    })
    .then(data => PubSub.emit('data-sorted', data))
    .catch(e => console.log(e));
}

function statsCollector(url) {
  const pagesCall = db.getCollection(url);
  const pages = db.getCollection(url).find();
  const data = [];
  const stats = {};

  const uniqueURLs = pages.map(page => page.url).filter((url, i, arr) => arr.indexOf(url) === i);

  uniqueURLs.forEach(url => {
    const info = {};
    const uniqueObj = pagesCall.find({ url });
    info.url = url;
    info.avgTime = Math.round(
      uniqueObj.map(obj => obj.time).reduce((a, b) => a + b) / uniqueObj.length,
    );
    info.maxTime = Math.max.apply(Math, uniqueObj.map(obj => obj.time));
    info.minTime = Math.min.apply(Math, uniqueObj.map(obj => obj.time));
    info.size = uniqueObj.map(obj => obj.size).pop();
    data.push(info);
  });
  stats.avgTime = Math.round(data.map(obj => obj.avgTime).reduce((a, b) => a + b) / data.length);
  stats.avgMin = Math.min.apply(Math, data.map(obj => obj.avgTime));
  stats.avgMax = Math.max.apply(Math, data.map(obj => obj.avgTime));
  stats.data = data;
  return stats;
}
