import { createReadStream } from 'fs';
import PubSub from '../emitter';
import Crawler from '../crawler';
import config from '../config';
import db from '../database/loki';

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
  console.log(JSON.stringify(ctx, null, 2));
  ctx.type = 'html';
  ctx.body = createReadStream(`${config.rootDir}/public/views/index.html`);
  // app.use(serve(path.join(config.rootDir, '/public')));
  // await ctx.render('index', { title: 'Basic Crawler Index' });
};

routes.crawl = async (ctx, next) => {
  const url = ctx.query.url;
  if (url) {
    if (db.getCollection(url) === null) {
      db.addCollection(
        url,
        {
          // unique: ['id'],
          // indices: ['id'],
          // autoupdate: true,
        },
      );
    } else {
      db.getCollection(url).clear();
    }
    crawler.crawl(ctx.query.url);

    let resolve;
    const promise = new Promise((ok, reject) => (resolve = ok));

    PubSub.on('data-sorted', data => {
      console.log(data);
      resolve(data);
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
