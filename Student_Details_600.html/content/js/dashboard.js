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

    var data = {"OkPercent": 93.7936507936508, "KoPercent": 6.2063492063492065};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.11325396825396826, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.15642857142857142, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.11642857142857142, 500, 1500, "Create Student"], "isController": false}, {"data": [0.2742857142857143, 500, 1500, "Update Student"], "isController": false}, {"data": [0.0014285714285714286, 500, 1500, "Final Student Create"], "isController": false}, {"data": [0.0035714285714285713, 500, 1500, "Get Student"], "isController": false}, {"data": [0.10785714285714286, 500, 1500, "Delete Student-1"], "isController": false}, {"data": [0.04428571428571428, 500, 1500, "Delete Student-0"], "isController": false}, {"data": [0.2842857142857143, 500, 1500, "Get Soecific Student"], "isController": false}, {"data": [0.030714285714285715, 500, 1500, "Delete Student"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6300, 391, 6.2063492063492065, 24365.43539682542, 70, 132063, 10240.5, 66165.5, 76448.84999999999, 120161.22999999997, 34.17727699326762, 70.11701055291239, 9.307030067527247], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 700, 22, 3.142857142857143, 22393.391428571424, 489, 77071, 5308.0, 55332.9, 64367.0, 68910.83, 3.9409754477229604, 1.5749496997821202, 2.203042661762967], "isController": false}, {"data": ["Create Student", 700, 0, 0.0, 4672.438571428565, 418, 52195, 3843.5, 8509.899999999998, 12208.8, 15732.43, 8.316008316008316, 4.1011564449064455, 2.8829911642411643], "isController": false}, {"data": ["Update Student", 700, 46, 6.571428571428571, 3700.117142857144, 250, 62217, 1586.0, 10797.999999999998, 14675.199999999997, 16108.09, 4.801920768307323, 2.308914637283485, 1.511519786486023], "isController": false}, {"data": ["Final Student Create", 700, 5, 0.7142857142857143, 46903.95714285717, 998, 80076, 58425.5, 70767.3, 74464.25, 79092.45, 3.9108111581029217, 3.080418498695465, 0.6484100894039364], "isController": false}, {"data": ["Get Student", 700, 0, 0.0, 14358.677142857137, 1057, 26892, 16790.0, 20649.6, 20839.649999999998, 24102.54, 20.57189878625797, 269.68795001028593, 3.194269440444353], "isController": false}, {"data": ["Delete Student-1", 700, 0, 0.0, 20787.290000000037, 70, 69742, 9713.0, 55671.7, 62919.85, 67499.95, 4.263223606078139, 1.7690712643503153, 0.695271818569384], "isController": false}, {"data": ["Delete Student-0", 700, 0, 0.0, 40510.98142857147, 128, 72811, 49033.5, 66527.2, 69243.05, 71763.6, 3.937362192323269, 1.7802721631305405, 0.9728053072829952], "isController": false}, {"data": ["Get Soecific Student", 700, 318, 45.42857142857143, 4663.542857142858, 227, 68721, 1103.5, 4036.599999999994, 41563.44999999999, 55566.850000000006, 4.1394889505212795, 6.039784646783321, 0.36840758664837403], "isController": false}, {"data": ["Delete Student", 700, 0, 0.0, 61298.52285714284, 203, 132063, 60348.5, 118614.49999999999, 125514.95, 131499.54, 3.922052017615616, 3.400848073712166, 1.608654147850155], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 312, 79.79539641943734, 4.9523809523809526], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 79, 20.20460358056266, 1.253968253968254], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6300, 391, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 312, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 79, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Create Student Address", 700, 22, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 11, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Update Student", 700, 46, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 46, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Final Student Create", 700, 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Get Soecific Student", 700, 318, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 250, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Unrecognized Windows Sockets error: 0: recv failed", 68, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
