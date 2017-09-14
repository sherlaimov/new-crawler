import fetch from 'node-fetch';
// import Crawler from '../crawler';
import PubSub from '../emitter';
import config from '../config';
import db from '../database/loki';

// const crawler = new Crawler();

// crawler.on('data-received', dataHandler);
PubSub.on('data-received', dataHandler);

function dataHandler(data) {
  const pages = db.getCollection('sites').find();
  pages
    .map(page => {
      return visitPage(page.url)
    })
    
}




function visitPage(url) {
  const start = new Date().getTime();
  return fetch(url)
    .then(resp => resp.text())
    .then(body => {
      const reqTime = new Date().getTime() - start;
      return {
        url,
        time: reqTime,
        body,
        size: body.length,
      };
    })
    .catch(err => {
      console.log(err);
      console.log('Status code: ' + resp.status);
      console.log(`An error has occurred \n code: ${error.code}`);
    });
}