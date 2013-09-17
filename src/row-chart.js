dc.rowChart = function (parent, chartGroup) {

    var _g;

    var _labelOffsetX = 10;

    var _labelOffsetY = 15;

    var _gap = 5;

    var _rowCssClass = "row";

    var _chart = dc.marginable(dc.colorChart(dc.baseChart({})));
    
    var _xScale;

    var _x;

    var _elasticX;

    var _xAxis = d3.svg.axis().orient("bottom");

    var _rowsCap = Infinity;
    
    var _rowOther = true;

    var _othersLabel = "Others";

    var _othersHandler = function (data, value) {
        data.push({"key": _othersLabel, "value": value });
    };

    var _rowData = null;

    function assembleData() {
        if (_rowsCap == Infinity) {
            _rowData = _chart.computeOrderedGroups(); // ordered by keys
        } else {
            var topRows = _chart.group().top(_rowsCap); // ordered by value
            if (_rowOther) {
                var topRowsSum = d3.sum(topRows, _chart.valueAccessor());
                var allRows = _chart.group().all();
                var allRowsSum = d3.sum(allRows, _chart.valueAccessor());
                _othersHandler(topRows,allRowsSum - topRowsSum);
 			}
            _rowData = topRows;
        }
    }

    function calculateAxisScale() {
        if (!_x || _elasticX) {
            var extent = d3.extent(_chart.group().all(), _chart.valueAccessor());
            if (extent[0] > 0) extent[0] = 0;
            _x = d3.scale.linear().domain(extent)
                .range([0, _chart.effectiveWidth()]);

            _xAxis.scale(_x);
        }
    }

    function drawAxis() {
        var axisG = _g.select("g.axis");

        calculateAxisScale();

        if (axisG.empty())
            axisG = _g.append("g").attr("class", "axis")
                .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")");

        dc.transition(axisG, _chart.transitionDuration())
            .call(_xAxis);
    }

    _chart.doRender = function () {

        _chart.resetSvg();

        assembleData();
 
        _g = _chart.svg()
            .append("g")
            .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

        _g.append("g").attr("class", "axis")
                        .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")")
                        .call(_xAxis);

        drawChart();

        return _chart;
    };

    _chart.title(function (d) {
        return _chart.keyAccessor()(d) + ": " + _chart.valueAccessor()(d);
    });

    _chart.label(function (d) {
        return _chart.keyAccessor()(d);
    });

    _chart.x = function(x){
        if(!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    function drawGridLines() {
        _g.selectAll("g.tick")
            .select("line.grid-line")
            .remove();

        _g.selectAll("g.tick")
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", function (d) {
                return -_chart.effectiveHeight();
            });
    }

    function drawChart() {
        _xScale = d3.scale.linear().domain([0, d3.max(_rowData, _chart.valueAccessor())]).range([0, _chart.effectiveWidth()]);
        _xAxis.scale(_xScale);

        drawAxis();
        drawGridLines();

        var rows = _g.selectAll("g." + _rowCssClass)
                     .data(_rowData);

        createElements(rows, _rowData);
        removeElements(rows);
        updateElements(rows);
    }

    function createElements(rows) {
        var rowEnter = rows.enter()
            .append("g")
            .attr("class", function (d, i) {
                return _rowCssClass + " _" + i;
            });

        rowEnter.append("rect").attr("width", 0);

        createLabels(rowEnter);
        updateLabels(rows);
    }

    function removeElements(rows) {
        rows.exit().remove();
    }

    function updateElements(rows) {
        var n = _rowData.length;

        var rect = rows.attr("transform",function (d, i) {
                return "translate(0," + ((i + 1) * _gap + i * height) + ")";
            }).select("rect")
            .attr("height", height)
            .attr("fill", _chart.getColor)
            .on("click", onClick)
            .classed("deselected", function (d) {
                return (_chart.hasFilter()) ? !_chart.isSelectedRow(d) : false;
            })
            .classed("selected", function (d) {
                return (_chart.hasFilter()) ? _chart.isSelectedRow(d) : false;
            });

        dc.transition(rect, _chart.transitionDuration())
            .attr("width", function (d) {
                var start = _x(0) == -Infinity ? _x(1) : _x(0);
                return Math.abs(start - _x(_chart.valueAccessor()(d)));
            })

        createTitles(rows);
    }

    function createTitles(rows) {
        if (_chart.renderTitle()) {
            rows.selectAll("title").remove();
            rows.append("title").text(function (d) {
                return _chart.title()(d);
            });
        }
    }

    function createLabels(rowEnter) {
        if (_chart.renderLabel()) {
            rowEnter.append("text")
                .on("click", onClick);
        }
    }

    function updateLabels(rows) {
        if (_chart.renderLabel()) {
            var lab = rows.select("text")
                .attr("x", _labelOffsetX)
                .attr("y", _labelOffsetY)
                .on("click", onClick)
                .attr("class", function (d, i) {
                    return _rowCssClass + " _" + i;
                })
                .text(function (d) {
                            if (_chart.valueAccessor()(d) > 0) {
                                return _chart.label()(d);
                            } else {
                                return "";
                            }
                });
        }
    }

    function numberOfRows() {
        return _rowData.length;
    }

    function rowHeight() {
        var n = numberOfRows();
        return (_chart.effectiveHeight() - (n + 1) * _gap) / n;
    }

    function onClick(d) {
        _chart.onClick(d);
    }

    function translateX(d) {
        var x = _x(_chart.valueAccessor()(d)),
            x0 = _x(0),
            s = x > x0 ? x0 : x;
        return "translate("+s+",0)";
    }

    _chart.doRedraw = function () {
        drawChart();
        return _chart;
    };

    _chart.xAxis = function () {
        return _xAxis;
    };

    _chart.gap = function (g) {
        if (!arguments.length) return _gap;
        _gap = g;
        return _chart;
    };

    _chart.elasticX = function (_) {
        if (!arguments.length) return _elasticX;
        _elasticX = _;
        return _chart;
    };

    _chart.labelOffsetX = function (o) {
        if (!arguments.length) return _labelOffsetX;
        _labelOffsetX = o;
        return _chart;
    };

    _chart.labelOffsetY = function (o) {
        if (!arguments.length) return _labelOffsetY;
        _labelOffsetY = o;
        return _chart;
    };

    _chart.isSelectedRow = function (d) {
        return _chart.hasFilter(_chart.keyAccessor()(d));
    };

    _chart.rowsCap = function (_) {
        if (!arguments.length) return _rowsCap;
        _rowsCap = _;
        return _chart;
    };
    
    _chart.rowOther = function (_) {
    	if (!arguments.length) return _rowOther;
    	_rowOther = _;
    	return _chart;
    }

    _chart.othersLabel = function (_) {
        if (!arguments.length) return _othersLabel;
        _othersLabel = _;
        return _chart;
    };

    _chart.othersHandler = function (_) {
        if (!arguments.length) return _othersHandler;
        _othersHandler = _;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};
