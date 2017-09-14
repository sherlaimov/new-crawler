import path from 'path';
import Koa from 'koa';
import _ from 'koa-route';
import bodyParser from 'koa-bodyparser';
import morgan from 'koa-morgan';
import hbs from 'koa-hbs';
import serve from 'koa-static';
import IO from 'koa-socket';
import db from './database/loki';
import routes from './routes';
import config from './config';
import dataHandler from './utils/data-handler';

const app = new Koa();
const io = new IO();

app.use(async (ctx, next) => {
  try {
    await next(); // next is now a function, await instead of yield
  } catch (err) {
    ctx.body = { message: err.message };
    ctx.status = err.status || 500;
  }
});

app.context.io = io;

app.use(serve(path.join(config.rootDir, '/public')));
app.use(bodyParser());
app.use(morgan('combined'));

app.use(
  hbs.middleware({
    viewPath: path.join(config.rootDir, './public/views'),
    defaultLayout: 'layout',
  }),
);

app.use(_.get('/', routes.index));

app.use(_.get('/crawl', routes.crawl));
app.use(_.get('/stop', routes.stop));
app.use(_.post('/data', routes.data));

io.attach(app);

io.on('join', (ctx, data) => {
  console.log('join event fired', data);
});

app.on('error', err => {
  console.log('server error', err);
});
app.listen(3000, () => {
  // db.loadDatabase({}, err => {
  //   if (err) {
  //     console.log(`Error loading DB : ${err}`);
  //   } else {
  //     console.log('database loaded.');
  //     const sites = db.getCollection('sites');
  //     // sites.clear();
  //     db.saveDatabase(err => {
  //       if (err) console.log(`DB on save attempt error: ${err}`);
  //       console.log('DB removed data only');
  //     });
  //     // console.log(sites);
  //   }
  // });
  // sites.chain().remove();
  console.log('Listening on port 3000');
});
