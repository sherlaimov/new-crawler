<script id="table-template" type="text/x-handlebars-template">
<h2>Site response stats</h2>
<div class="progress">
    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%;">0%
    </div>
</div>
<div class="values">
    <span id="minAvg">{{avgMin}}</span>
    <span id="maxAvg">{{avgMax}}</span>
</div>
<div id="chart"></div>

<!--<div class="totalAvgBar" data-val="30"><span></span></div>-->

<table class="table table-striped table-responsive">
    <thead>
        <th>#</th>
        <th>URL</th>
        <th>MIN TIME</th>
        <th>AVG TIME</th>
        <th>MAX TIME</th>
        <th>SIZE</th>
    </thead>
    <tbody>
        {{#each data}}
        <tr>
            <td>{{counter @index}}</td>
            <td><a href="{{url}}" target="_blank">{{url}} </a></td>
            <td>{{minTime}}</td>
            <td>{{avgTime}}</td>
            <td>{{maxTime}}</td>
            <td>{{size}}</td>
        </tr>
        {{/each}}
    </tbody>
</table>
</script>