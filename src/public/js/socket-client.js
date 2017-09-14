/**
 * Created by ES on 09.02.2017.
 */

const socket = io('http://localhost:3000');

socket.on('disconnect', function() {
  const status = document.querySelector('.socket-status');
  status.firstChild.textContent = 'Socket IO disconnected';
  const span = status.querySelector('span');
  if (span.classList.contains('glyphicon-ok-sign')) {
    span.classList.remove('glyphicon-ok-sign');
    span.classList.add('glyphicon-remove-sign');
  }
  status.style.color = 'red';
  // socket.close();
});

socket.on('connect', function() {
  const status = document.querySelector('.socket-status');
  status.firstChild.textContent = 'Socket IO connected';
  const span = status.querySelector('span');
  if (span.classList.contains('glyphicon-remove-sign')) {
    span.classList.remove('glyphicon-remove-sign');
    span.classList.add('glyphicon-ok-sign');
  }
  status.style.color = '#64d64d';
});

socket.on('message', function(message) {
  // console.log(message);
  // printMessage(message);
});

function setTitle(title) {
  document.querySelector('h1').innerHTML = title;
}

function printMessage(message) {
  const p = document.createElement('p');
  p.innerText = message;
  const messagesDiv = document.querySelector('div.messages');
  messagesDiv.insertBefore(p, messagesDiv.firstChild);
}

function printTable(data) {
  const tr = document.createElement('tr');
  const html = `<td>${data.url}</td><td>${data.time}</td><td>${data.size}</td>`;
  tr.innerHTML = html;
  const tbody = document.querySelector('#realTimeTable tbody');
  tbody.insertBefore(tr, tbody.firstChild);
}

//const h3 = document.querySelector('h3');
// const aveResTime = document.querySelector('#aveResTime');
const pagesCrawled = document.querySelector('#pagesCrawled');
//mHeader.appendChild(h3);
//span.inner
let arr = [];

let avg = 0;
let minTime = 0;
let maxTime = 0;
const liveProgress = document.querySelector('.live-speed');
const minSpan = document.querySelector('#minSpeed');
const maxSpan = document.querySelector('#maxSpeed');
function averageLoadTime(time) {
  arr.push(time);

  if (arr.length != 0) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += parseInt(arr[i]);
    }

    avg = Math.round(sum / arr.length);
    minTime = Math.min.apply(null, arr);
    maxTime = Math.max.apply(null, arr);
    const percent = Math.round((avg - minTime) / (maxTime - minTime) * 100);
    liveProgress.style.width = `${percent}%`;
    liveProgress.innerHTML = `${avg} ms`;
    minSpan.innerHTML = minTime;
    maxSpan.innerHTML = maxTime;
    // console.log(`Min val ${Math.min.apply(null, arr)}`);
    // console.log(`AVG val ${Math.round(avg)}`);
    // console.log(`Max val ${Math.max.apply(null, arr)}`);
    // aveResTime.innerHTML = Math.round(avg);
    pagesCrawled.innerHTML = arr.length;
    //console.log(`Response time sum ${sum}`);
    //console.log(`Array length ${arr.length}`);
    ////
    //console.log('AVERAGE');
    //console.log(avg);
  }
}

socket.on('live-table', data => {
  console.log(data);
  averageLoadTime(data.time);
  printTable(data);
});
