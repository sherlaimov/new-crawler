import PubSub from '../emitter';
import Crawler from '../crawler';
import config from '../config';

const crawler = new Crawler();
const routes = {};

routes.index = async (ctx, next) => {
  const io = ctx.io;
  const connections = [];

  io.on('connection', function(ctx, data) {
    // console.log(socket);
    const socket = ctx.socket;
    console.log('io data', data);
    connections.push(socket);
    console.log(`Connected: ${connections.length} sockets connected`);

    crawler.on('live-table', data => {
      socket.emit('live-table', data);
    });

    socket.on('disconnect', () => {
      connections.splice(connections.indexOf(socket), 1);
      console.log(`Disconnected: ${connections.length} sockets connected`);
    });
  });
  await ctx.render('index', { title: 'Basic Crawler Index' });
};

routes.crawl = async (ctx, next) => {
  if (ctx.query.url) {
    crawler.crawl(ctx.query.url);

    let resolve;
    const promise = new Promise((ok, reject) => (resolve = ok));

    PubSub.on('data-sorted', data => {
      const avgSum = data.reduce((a, b) => a + b.avgTime, 0);
      const minSum = data.reduce((a, b) => a + b.minTime, 0);
      const maxSum = data.reduce((a, b) => a + b.maxTime, 0);

      const avgMax = Math.round(maxSum / data.length);
      const avgMin = Math.round(minSum / data.length);
      const avgTime = Math.round(avgSum / data.length);

      resolve({
        reqParams: ctx.query,
        data,
        avgTime,
        avgMin,
        avgMax,
      });
      PubSub.removeAllListeners('data-sorted');
    });
    // ctx.response.status = 200;
    ctx.response.body = await promise;
  } else {
    ctx.status = 500;
    ctx.response.body = { message: `Cannot crawl ${ctx.query.url}, please provide a valid URL` };
  }
};

routes.stop = async (ctx, next) => {
  crawler.emit('crawler-stop');
  ctx.status = 200;
  ctx.body = { msg: 'Stop action' };
};

const data = {};

routes.data = async (ctx, next) => {
  console.log(ctx.body);
  if (ctx.body.url) {
    data.data = crawler.crawl(ctx.body.url);
    ctx.redirect(`${config.url}`);
  } else {
    ctx.body = { resp: req.body };
  }
};

export default routes;
