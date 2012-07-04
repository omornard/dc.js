require("./env");

var vows = require('vows');
var assert = require('assert');

var suite = vows.describe('Bar chart');

var width = 1100;
var height = 200;

suite.addBatch({
    'bar chart generation': {
        topic: function() {
            d3.select("body").append("div").attr("id", "bar-chart");
            var chart = dc.barChart("#bar-chart");
            chart.dimension(dateDimension).group(dateGroup)
                .width(width).height(height)
                .x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2012, 11, 31)]))
                .filter([new Date(2012, 5, 01), new Date(2012, 5, 30)])
                .xUnits(d3.time.days);
            chart.render();
            return chart;
        },
        'we get something': function(chart) {
            assert.isNotNull(chart);
        },
        'svg should be created': function(chart) {
            assert.isFalse(chart.select("svg").empty());
        },
        'dimension should be set': function(chart) {
            assert.equal(chart.dimension(), dateDimension);
        },
        'group should be set': function(chart) {
            assert.equal(chart.group(), dateGroup);
        },
        'width should be set': function(chart) {
            assert.equal(chart.width(), width);
        },
        'height should be set': function(chart) {
            assert.equal(chart.height(), height);
        },
        'height should be used for svg': function(chart) {
            assert.equal(chart.select("svg").attr("height"), height);
        },
        'margin should be set': function(chart) {
            assert.isNotNull(chart.margins());
        },
        'x can be set': function(chart) {
            assert.isTrue(chart.x() != undefined);
        },
        'x range round is auto calculated based on width': function(chart) {
            assert.equal(chart.x().range()[0], 0);
            assert.equal(chart.x().range()[1], 1030);
        },
        'y can be set': function(chart) {
            assert.isTrue(chart.y() != undefined);
        },
        'y range round is auto calculated based on height': function(chart) {
            assert.equal(chart.y().range()[0], 160);
            assert.equal(chart.y().range()[1], 0);
        },
        'y domain is auto calculated based on height': function(chart) {
            assert.equal(chart.y().domain()[0], 0);
            assert.equal(chart.y().domain()[1], 3);
        },
        'root g should be created': function(chart) {
            assert.isFalse(chart.select("svg g").empty());
        },
        'root g should be translated to left corner': function(chart) {
            assert.equal(chart.select("svg g").attr("transform"), "translate(20,10)");
        },
        'axis x should be placed at the bottom': function(chart) {
            assert.equal(chart.select("svg g g.x").attr("transform"), "translate(20,170)");
        },
        'axis y should be placed on the left': function(chart) {
            assert.equal(chart.select("svg g g.y").attr("transform"), "translate(20,10)");
        },
        'bar x should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('x'), chart.x()(d.key) + chart.margins().left);
            });
        },
        'bar y should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('y'), chart.margins().top + chart.y()(d.value));
            });
        },
        'bar height should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('height'),
                    chart.height() - chart.margins().top - chart.margins().bottom - chart.y()(d.value));
            });
        },
        'bar width should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('width'), 3);
            });
        },
        'x units should be set': function(chart) {
            assert.equal(chart.xUnits(), d3.time.days);
        },
        'x axis should be created': function(chart) {
            assert.isNotNull(chart.axisX());
        },
        'y axis should be created': function(chart) {
            assert.isNotNull(chart.axisY());
        },
        'brush should be created': function(chart) {
            assert.isNotNull(chart.select("g.brush"));
        },
        'brush should be positioned with offset (left margin)': function(chart) {
            assert.equal(chart.select("g.brush").attr("transform"), "translate(" + chart.margins().left + ",0)");
        },
        'brush rect should be stretched to cover the chart': function(chart) {
            chart.select("g.brush").selectAll("rect").each(function(d) {
                assert.equal(d3.select(this).attr("height"), 170);
            });
        },
        'brush fancy resize handle should be created': function(chart) {
            chart.select("g.brush").selectAll(".resize path").each(function(d, i) {
                if (i == 0)
                    assert.equal(d3.select(this).attr("d"), "M0.5,56.666666666666664A6,6 0 0 1 6.5,62.666666666666664V107.33333333333333A6,6 0 0 1 0.5,113.33333333333333ZM2.5,64.66666666666666V105.33333333333333M4.5,64.66666666666666V105.33333333333333");
                else
                    assert.equal(d3.select(this).attr("d"), "M-0.5,56.666666666666664A6,6 0 0 0 -6.5,62.666666666666664V107.33333333333333A6,6 0 0 0 -0.5,113.33333333333333ZM-2.5,64.66666666666666V105.33333333333333M-4.5,64.66666666666666V105.33333333333333");
            });
        },
        'filter should extent brush when rendered': function(chart){
            assert.equal(chart.select("g.brush rect.background").attr("width"), 1030);
            assert.equal(chart.select("g.brush rect.background").attr("height"), 170);
            assert.equal(chart.select("g.brush rect.extent").attr("width"), 82);
            assert.equal(chart.select("g.brush rect.extent").attr("height"), 170);
        },
        teardown: function(topic) {
            resetAllFilters();
        }
    },

    'extra large bar chart generation': {
        topic: function() {
            d3.select("body").append("div").attr("id", "bar-chart2");
            var chart = dc.barChart("#bar-chart2");
            chart.dimension(dateDimension).group(dateGroup)
                .width(width).height(height)
                .x(d3.time.scale().domain([new Date(2000, 0, 1), new Date(2012, 11, 31)]))
                .xUnits(d3.time.days);
            chart.render();
            return chart;
        },
        'min bar width should be set correctly': function(chart) {
            chart.selectAll("svg g rect.bar").each(function(d) {
                assert.equal(d3.select(this).attr('width'), 1);
            });
        },
        teardown: function(topic) {
            resetAllFilters();
        }
    }
});

suite.export(module);

