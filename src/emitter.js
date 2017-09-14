import events from 'events';

const emitter = new events.EventEmitter();

let cnt = 0;
emitter.on('data-received', e => {
  cnt++;
  console.log(`Data-received event triggered ${cnt} times`);
});

emitter.on('data-sorted', () => {
  console.log('********* DATA SORTED EVENT');
});

export default emitter;
