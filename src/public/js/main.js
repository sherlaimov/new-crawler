/**
 * Created by ES on 04.02.2017.
 */

(function($, Handlebars, d3) {
  const Twitch = {
    init: function(elem, options) {
      console.log('INITIALIZED');
      const self = this;
      self.options = options || {};
      self.url = 'http://localhost:3000/';
      self.options.ajax = {
        url: self.url + 'crawl/',
        type: 'GET',
        // data: {
        //    type: 'suggest',
        //    query: this.options.search
        // },
        dataType: 'json',
        contentType: 'application/json: charset=utf-8',
      };
      self.elem = elem;
      self.$elem = $(elem);
      self.template = Handlebars.compile($('#table-template').html());
      self.$modal = $('#statsModal');
      self.$form = $('#urlForm');
      self.$stopBtn = $('#stopCrawling');
      self.$form.on('submit', e => {
        e.preventDefault();
        console.log('SUBMIT');
        const url = document.querySelector('#urlInput').value;
        if (self.validateURL(url)) {
          self
            .fetch({
              data: self.$form.serialize(),
            })
            .done(data => {
              self.render(data);
              self.$modal.modal('hide');
            })
            .fail(e => {
              console.log(e);
              console.log('Query failed');
            });
          self.$modal.modal({ keyboard: false });
        } else {
          const alert = document.querySelector('.alert');
          alert.innerHTML = `<strong>${url}</strong> is not a valid URL. Please, enter a valid one which starts with either "http://" or "www."`;
          alert.style.display = 'block';
          setTimeout(() => {
            alert.style.display = 'none';
          }, 2500);
        }
      });
      self.$modal.on('hidden.bs.modal', e => {
        self.$modal.find('#realTimeTable tbody').html('');
        document.querySelector('#pagesCrawled').innerHTML = '';
      });

      self.$stopBtn.on('click', e => {
        self.fetch({ url: self.url + 'stop/' });
      });
    },

    render: function(data) {
      const self = this;
      if ('data' in data) {
        console.log(data);
        self.$elem.html('').append(self.template(data));
        // createChart(data);
        barChart(data);
      }
      if (data.avgTime) {
        // let end = data.avgMax - data.avgMin;
        // let newAvg = data.avgTime - data.avgMin;
        // let val = ( newAvg / end ) * 100;
        let newAvg = Math.round((data.avgTime - data.avgMin) / (data.avgMax - data.avgMin) * 100);
        console.log(newAvg);
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${newAvg}%`;
        progressBar.innerHTML = `Average page speed ${data.avgTime} ms`;
        //const span = document.createElement('span');
      }
    },

    fetch: function(options) {
      const self = this;
      const opts = $.extend({}, self.options.ajax, options);
      return $.ajax(opts);
    },
    validateURL: function(textval) {
      var urlregex = new RegExp(
        '^(http://www.|https://www.|ftp://www.|www.|http://|https://){1}([0-9A-Za-z]+.)',
      );
      return urlregex.test(textval);
    },

    renderTable: function(elem, data) {
      const self = this;
      //console.log(data);
      const table = $(document.createElement('table')).addClass('table table-striped');

      const thead = $(document.createElement('thead'));
      thead.append($('<th>').text('#'));
      const tbody = $(document.createElement('tbody'));

      $.each(data, (rowIndex, r) => {
        if (rowIndex === 0) {
          Object.keys(r).forEach((key, i) => {
            const th = $('<th/>');
            th.text(key);
            thead.append(th);
          });
        }
        const row = $('<tr/>');

        row.append($('<td>').text(++rowIndex));
        $.each(r, function(colIndex, c) {
          row.append($('<td>').text(c));
          tbody.append(row);
        });
      });
      table.append(thead);
      table.append(tbody);
      //console.log(elem);
      return elem.append(table);
    },
  };

  const table = document.querySelector('#table');

  Twitch.init(table, {});

  Handlebars.registerHelper('makeLink', (text, url) => {
    text = Handlebars.Utils.escapeExpression(text);
    url = Handlebars.Utils.escapeExpression(url);
    const link = `<a href="${text}">${url}</a>`;
    return new Handlebars.SafeString(link);
  });

  Handlebars.registerHelper('counter', function(value, options) {
    return parseInt(value) + 1;
  });

  function barChart({ data: data, avgMax: avgMax, avgMin: avgMin, avgTime: avgTime }) {
    // Variable declaration
    const margin = { top: 20, right: 20, bottom: 40, left: 30 };
    const height = 800 - margin.top - margin.bottom;
    let width = 900 - margin.left - margin.right;
    const colors = d3
      .scaleLinear()
      .domain([avgMin, avgMax])
      .range(['#f4eb42', '#f44141']);

    // Add svg to
    const svg = d3
      .select('#chart')
      .append('svg')
      // .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    // .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const chartG = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X scale
    const x = d3.scaleLinear().range([0, width]);
    const y = d3
      .scaleBand()
      .rangeRound([height, 0])
      .padding(0);

    const xAxis = d3.axisTop(x);
    const yAxis = d3.axisLeft(y);
    //.tickSize(6, 4);

    // x.domain(d3.extent(data, function (d) { return d.avgTime;})).nice();
    x.domain([avgMin, avgMax]);
    y.domain(d3.range(0, data.length).reverse());

    chartG
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', function(d) {
        return 'bar bar--' + (d.avgTime < avgTime ? 'negative' : 'positive');
      });

    chartG
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,0)');
    // .call(xAxis);

    var tickNegative = chartG.append('g').attr('class', 'y axis');
    // .attr('transform', 'translate(' + x(avgTime) + ',0)')
    // .call(yAxis);

    tickNegative.select('line').attr('x2', 6);

    tickNegative
      .select('text')
      .attr('x', 9)
      .style('text-anchor', 'start');

    let tempColor;
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'toolTip');
    // .style('position', 'absolute')
    // .style('padding', '0 10px')
    // .style('background', '#fff')
    // .style('opacity', 0);

    // Drawing ///////////////////////////////////
    //////////////////////////////////////////////
    function drawChart() {
      // reset the width
      width = parseInt(d3.select('.container').style('width'), 10) - margin.left - margin.right;

      // set the svg dimensions
      svg.attr('width', width + margin.left + margin.right);

      // Set new range for xScale
      x.range([0, width]);

      // give the x axis the resized scale
      xAxis.scale(x);

      // draw the new xAxis
      svg.select('.x.axis').call(xAxis);

      chartG
        .selectAll('.bar')
        .style('fill', (d, i) => colors(d.avgTime))
        .attr('x', function(d) {
          return x(Math.min(avgTime, d.avgTime));
        })
        .attr('y', function(d, i) {
          return y(i);
        })
        .attr('width', function(d) {
          return Math.abs(x(d.avgTime) - x(avgTime));
        })
        .attr('height', 25);

      tickNegative.attr('transform', 'translate(' + x(avgTime) + ',0)').call(yAxis);
    }

    //CHART EVENTS
    svg
      .selectAll('.bar')
      .on('mousemove', function(d, i, e) {
        //console.dir(this);
        tooltip.transition().style('opacity', 0.9);

        tooltip
          .html(
            `<p class="text-primary">${data[i]
              .url}</p> <span ><span class="glyphicon glyphicon-scale"></span> ${d.avgTime} ms</span>`,
          )
          .style('left', d3.event.pageX - 20 + 'px')
          .style('top', d3.event.pageY - 100 + 'px')
          .style('display', 'inline-block');

        // console.log(d3.select(this).style('fill'));
        if (d3.select(this).style('fill') != 'rgb(251, 246, 6)') {
          tempColor = this.style.fill;
        }
        d3
          .select(this)
          .transition()
          //.style('opacity', .5)
          // .style('fill', '#fbf606')
          .style('stroke', '#337ab7');
      })
      .on('mouseout', function(d) {
        tooltip.html('').style('display', 'none');

        d3
          .select(this)
          .transition()
          .duration(250)
          //.style('opacity', 1)
          // .style('fill', tempColor)
          .style('stroke', 'none');
      });

    svg.selectAll('.bar').on('click', (d, i) => {
      window.open(d.url, '_blank');
    });

    // Resizing //////////////////////////////////
    //////////////////////////////////////////////
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this,
          args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
      };
    }
    // redraw chart on resize
    window.addEventListener('resize', debounce(drawChart, 60, false));

    // call this once to draw the chart initially
    drawChart();
  }
})(jQuery, Handlebars, d3);
