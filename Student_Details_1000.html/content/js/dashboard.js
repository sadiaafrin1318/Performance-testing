/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 0.0, "KoPercent": 100.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.0, 500, 1500, "Create Student"], "isController": false}, {"data": [0.0, 500, 1500, "Update Student"], "isController": false}, {"data": [0.0, 500, 1500, "Final Student Create"], "isController": false}, {"data": [0.0, 500, 1500, "Get Student"], "isController": false}, {"data": [0.0, 500, 1500, "Get Soecific Student"], "isController": false}, {"data": [0.0, 500, 1500, "Delete Student"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7700, 7700, 100.0, 3006.7489610389644, 0, 21170, 1.0, 21031.0, 21042.0, 21057.0, 250.2274795268426, 628.5179670743696, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 1100, 1100, 100.0, 1.1218181818181832, 0, 205, 0.0, 1.0, 1.0, 8.980000000000018, 117.03372699223321, 290.4244301255453, 0.0], "isController": false}, {"data": ["Create Student", 1100, 1100, 100.0, 1.8954545454545486, 0, 222, 1.0, 1.0, 2.0, 59.99000000000001, 114.04872991187145, 283.0368714359772, 0.0], "isController": false}, {"data": ["Update Student", 1100, 1100, 100.0, 1.8209090909090895, 0, 218, 1.0, 1.0, 2.0, 37.98000000000002, 117.00882884799489, 290.3626442665674, 0.0], "isController": false}, {"data": ["Final Student Create", 1100, 1100, 100.0, 0.9281818181818173, 0, 232, 0.0, 1.0, 1.0, 5.980000000000018, 117.04618003830602, 290.455332916578, 0.0], "isController": false}, {"data": ["Get Student", 1100, 1100, 100.0, 21039.37454545455, 21010, 21170, 21038.0, 21053.0, 21062.0, 21108.99, 35.74678278954894, 100.64255349831016, 0.0], "isController": false}, {"data": ["Get Soecific Student", 1100, 1100, 100.0, 1.067272727272729, 0, 222, 0.0, 1.0, 1.0, 7.970000000000027, 117.03372699223321, 290.4244301255453, 0.0], "isController": false}, {"data": ["Delete Student", 1100, 1100, 100.0, 1.034545454545455, 0, 202, 0.0, 1.0, 1.0, 3.0, 117.07109408258835, 276.19143535147936, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 6126, 79.55844155844156, 79.55844155844156], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 474, 6.1558441558441555, 6.1558441558441555], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1100, 14.285714285714286, 14.285714285714286], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7700, 7700, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 6126, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1100, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 474, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 1100, 1100, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 1021, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 79, "", "", "", "", "", ""], "isController": false}, {"data": ["Create Student", 1100, 1100, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 1021, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 79, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Student", 1100, 1100, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 1021, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 79, "", "", "", "", "", ""], "isController": false}, {"data": ["Final Student Create", 1100, 1100, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 1021, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 79, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Student", 1100, 1100, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to thetestingworldapi.com:443 [thetestingworldapi.com/103.235.106.48] failed: Connection timed out: connect", 1100, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get Soecific Student", 1100, 1100, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 1021, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 79, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Student", 1100, 1100, "Non HTTP response code: java.net.NoRouteToHostException/Non HTTP response message: No route to host: connect", 1021, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: thetestingworldapi.com", 79, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
