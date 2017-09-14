import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
const viewsDir = path.resolve(publicDir, 'views');

const config = {
  debug: true,
  port: 3000,
  rootDir: __dirname,
  publicDir: path.resolve(process.cwd(), 'public'),
  viewsDir: path.resolve(publicDir, 'views'),
  layoutDir: path.resolve(viewsDir, 'layouts'),
  secretKey: process.env.SECRET_KEY || 'mybadasskey',
  db: {
    dialect: 'mysql',
    username: 'root',
    url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/test',
    password: '',
    host: '127.0.0.1',
    port: 3000,
    name: 'test',
  },
};

export default config;
