import Loki from 'lokijs';
import config from '../config';

const db = new Loki(`${config.rootDir}/database/db.json`);

db.loadDatabase({}, err => {
  if (err) {
    console.log(`Error loading DB : ${err}`);
  } else {
    console.log('database loaded.');
    if (db.getCollection('sites') === null) {
      db.addCollection('sites', {
        unique: ['id'],
        // indices: ['id'],
        autoupdate: true,
      });
    } else {
      db.getCollection('sites').clear();
    }
    db.saveDatabase(err => {
      if (err) {
        console.log(`DB on save attempt error: ${err}`);
      }
      console.log('DB saved from loki.js file');
    });
  }
});

function lokijsCRUD() {
  var info;
  db.loadDatabase({}, function() {
    //Initial collection
    info = db.getCollection('info');
    if (!info) info = db.addCollection('info');
    console.log('Initial info: ', info.data);
    //Create a user info
    info.insert({
      name: 'phchu',
      age: 18,
    });
    console.log('Add a user: ', info.data);
    //Read user's age
    var user = info.findObject({ name: 'phchu' });
    console.log('User ' + user.name + ' is ' + user.age + ' years old.');
    //Update user's age
    user.age = 30;
    info.update(user);
    console.log('User ' + user.name + ' is ' + user.age + ' years old.');
    //Delete the user
    info.remove(user);
    console.log('Collection info: ', info.data);
    //Save
    profilesDB.saveDatabase();
  });
}

export default db;
