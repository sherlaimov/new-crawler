/**
 * Created by ES on 04.02.2017.
 */

(function($, Handlebars, d3) {
  const Twitch = {
    init(elem, options) {
      this.options = options || {};
      this.url = 'http://localhost:3000/';
      this.options.ajax = {
        url: `${this.url}crawl/`,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json: charset=utf-8',
      };
      this.elem = elem;
      this.$elem = $(elem);
      this.template = Handlebars.compile($('#table-template').html());
      this.$modal = $('#statsModal');
      this.$form = $('#urlForm');
      this.$stopBtn = $('#stopCrawling');
      this.$checkDataBtn = $('#checkData');
      this.$form.on('submit', e => {
        e.preventDefault();
        const url = document.querySelector('#urlInput').value;
        if (this.validateURL(url)) {
          this.fetch({
            data: this.$form.serialize(),
          })
            .done(data => {
              this.render(data);
              this.$modal.modal('hide');
            })
            .fail(e => {
              console.log(e);
              console.log('Query failed');
            });
          this.$modal.modal({ keyboard: false });
        } else {
          const alert = document.querySelector('.alert');
          alert.innerHTML = `<strong>${url}</strong> is not a valid URL. Please, enter a valid one which starts with either "http://" or "www."`;
          alert.style.display = 'block';
          setTimeout(() => {
            alert.style.display = 'none';
          }, 2500);
        }
      });
      this.$modal.on('hidden.bs.modal', e => {
        this.$modal.find('#realTimeTable tbody').html('');
        document.querySelector('#pagesCrawled').innerHTML = '';
      });

      this.$stopBtn.on('click', e => {
        this.fetch({ url: `${this.url}stop/` });
      });
      this.$checkDataBtn.on('click', e => {
        this.fetch({ url: `${this.url}checkData/` })
          .done(data => {
            console.log(data);
            this.render(data);
          })
          .fail(e => {
            console.log(e);
            console.log('Query failed');
          });
      });
    },

    render(data) {
      if ('data' in data) {
        console.log(data);
        this.$elem.html('').append(this.template(data));
        barChart(data);
      }
      if (data.avgTime) {
        const newAvg = Math.round((data.avgTime - data.avgMin) / (data.avgMax - data.avgMin) * 100);
        const progressBar = document.querySelector('.progress-bar');
        progressBar.style.width = `${newAvg}%`;
        progressBar.innerHTML = `Average page speed ${data.avgTime} ms`;
      }
    },

    fetch(options) {
      const opts = $.extend({}, this.options.ajax, options);
      return $.ajax(opts);
    },
    validateURL(textval) {
      const urlregex = new RegExp(
        '^(http://www.|https://www.|ftp://www.|www.|http://|https://){1}([0-9A-Za-z]+.)',
      );
      return urlregex.test(textval);
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

  function barChart({ data, avgMax, avgMin, avgTime }) {
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
    const chartG = svg.append('g').attr('transform', `translate( ${margin.left}, ${margin.top})`);

    // X scale
    const x = d3.scaleLinear().range([0, width]);
    const y = d3
      .scaleBand()
      .rangeRound([height, 0])
      .padding(0);

    const xAxis = d3.axisTop(x);
    const yAxis = d3.axisLeft(y);
    // .tickSize(6, 4);

    // x.domain(d3.extent(data, function (d) { return d.avgTime;})).nice();
    x.domain([avgMin, avgMax]);
    y.domain(d3.range(1, data.length + 1).reverse());

    chartG
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', d => `bar bar-${d.avgTime < avgTime ? 'negative' : 'positive'}`);

    chartG
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,0)');
    // .call(xAxis);

    const yAxisG = chartG.append('g').attr('class', 'y axis');
    // .attr('transform', 'translate(' + x(avgTime) + ',0)')
    // .call(yAxis);

    yAxisG.select('line').attr('x2', 6);

    yAxisG
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
    // ////////////////////////////////////////////

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
        .style('fill', d => colors(d.avgTime))
        .attr('x', d => x(Math.min(avgTime, d.avgTime)))
        .attr('y', (d, i) => y(++i))
        .attr('width', d => Math.abs(x(d.avgTime) - x(avgTime)))
        .attr('height', 20);

      yAxisG.attr('transform', 'translate(' + x(avgTime) + ',0)').call(yAxis);
    }

    // CHART EVENTS
    svg
      .selectAll('.bar')
      .on('mousemove', function(d, i, e) {
        tooltip.transition().style('opacity', 0.9);

        tooltip
          .html(
            `<p class="text-primary">${data[i]
              .url}</p> <span ><span class="glyphicon glyphicon-scale"></span> ${d.avgTime} ms</span>`,
          )
          .style('left', d3.event.pageX - 20 + 'px')
          .style('top', d3.event.pageY - 100 + 'px')
          .style('display', 'inline-block');

        if (d3.select(this).style('fill') != 'rgb(251, 246, 6)') {
          tempColor = this.style.fill;
        }

        d3
          .select(this)
          .transition()
          .style('stroke', '#337ab7');
      })
      .on('mouseout', function(d) {
        tooltip.html('').style('display', 'none');

        d3
          .select(this)
          .transition()
          .duration(250)
          .style('stroke', 'none');
      });

    svg.selectAll('.bar').on('click', (d, i) => {
      window.open(d.url, '_blank');
    });

    // Resizing //////////////////////////////////
    // ////////////////////////////////////////////
    function debounce(func, wait, immediate) {
      let timeout;
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
