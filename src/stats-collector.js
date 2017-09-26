import fetch from 'node-fetch';
import PubSub from './emitter';

const output = [];

// PubSub.on('data-received', dataHandler);

function dataHandler(pagesVisited) {
  console.log('INSIDE dataHandler');
  for (let i = 0; i < 5; i++) {
    iterate(pagesVisited);
    console.log(`ITERATION NUMBER ${i}`);
  }

  output.length = 0;

  //Bluebird js?
  setTimeout(() => {
    //console.log('************* => OUTPUT <= ****************');

    const found = [];
    const sorted = output
      .map(function(page, i) {
        const newObj = {};
        newObj.time = [];
        newObj.size = [];
        for (let i = 0; i < output.length; i++) {
          if (page.url === output[i].url) {
            newObj.url = page.url;
            newObj.time.push(output[i].time);
            newObj.size = output[i].size;
          }
        }
        newObj.maxTime = Math.max.apply(Math, newObj.time);
        newObj.avgTime = Math.round(newObj.time.reduce((a, b) => a + b) / newObj.time.length);
        newObj.minTime = Math.min.apply(Math, newObj.time);
        return newObj;
      })
      .filter(function(page, i, arr) {
        for (let i = 0; i < arr.length; i++) {
          // if (page.url == arr[i].url && ! found.includes(arr[i].url)) {
          if (page.url == arr[i].url && found.indexOf(arr[i].url) == -1) {
            found.push(page.url);
            return page;
          }
        }
      });

    PubSub.emit('data-sorted', sorted);
    //console.log('************** => SORTED <= *********************');
    //console.log(JSON.stringify(sorted, null, 2));
  }, 2500);
}

function iterate(pagesVisited) {
  pagesVisited.forEach(url => {
    const infoObj = {};
    // console.log(`Collecting stats for page ${page.url}`);
    // const d = new Date();
    const before = new Date().getTime();
    return fetch(url)
      .then(resp => resp.text())
      .then(body => {
        const reqTime = new Date().getTime() - before;
        infoObj.url = url;
        infoObj.time = reqTime;
        infoObj.size = body.length;
        output.push(infoObj);
      })
      .catch(err => {
        console.log(err);
        console.log(`An error has occurred \n code: ${err.code}`);
      });
  });
}
