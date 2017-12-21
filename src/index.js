import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

class drawGauge { 
  constructor(props,key) {
    this.props = props;
    this.key = key;
  }
  draw() {
    let Needle,
      arc,
      arcEndRad,
      arcStartRad,
      barWidth,
      chart,
      chartInset,
      degToRad,
      el,
      endPadRad,
      height,
      i,
      margin,
      needle,
      numSections,
      padRad,
      percToDeg,
      percToRad,
      percent,
      radius,
      ref,
      sectionIndx,
      sectionPerc,
      startPadRad,
      svg,
      totalPercent,
      width;
    
    const props = this.props;
    const key = this.key;

    percent = props.percent / 100;
    barWidth = props.barWidth;
    numSections = props.colors.length;

    // sectionPerc = 1 / numSections / 2;

    sectionPerc = props.areaRatios; 

    padRad = 0 / (numSections - 1);
    chartInset = 10;
    totalPercent = 0.75;
    el = d3.select(`.${key}`);
    margin = {
      top: 10,
      right: 0,
      bottom: 0,
      left: 10
    };

    // width = el[0][0].offsetWidth - margin.left - margin.right;
    width = props.width;
    height = props.height;
    radius = Math.min(width) / 2;

    percToDeg = function(perc) {
      return perc * 360;
    };

    percToRad = function(perc) {
      return degToRad(percToDeg(perc));
    };

    degToRad = function(deg) {
      return deg * Math.PI / 180;
    };

    svg = el
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    chart = svg
      .append('g')
      .attr('transform', 'translate(' + (width + margin.left) / 2 + ', ' + (width + margin.top) / 2 + ')');

    for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
      arcStartRad = percToRad(totalPercent);
      arcEndRad = arcStartRad + percToRad(sectionPerc[sectionIndx-1]/2);
      totalPercent += sectionPerc[sectionIndx-1]/2;
      startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
      endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
      arc = d3.svg
        .arc()
        .outerRadius(radius - chartInset)
        .innerRadius(radius - chartInset - barWidth)
        .startAngle(arcStartRad + startPadRad)
        .endAngle(arcEndRad - endPadRad);
      chart
        .append('path')
        .style('fill', props.colors[sectionIndx - 1])
        .attr('d', arc);
    }

    Needle = (function() {
      function Needle(len, radius1) {
        this.len = len;
        this.radius = radius1;
      }

      Needle.prototype.drawOn = function(el, perc) {
        el
          .append('circle')
          .style('fill', props.needleColor)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', this.radius);
        return el
          .append('path')
          .style('fill', props.needleColor)
          .attr('class', 'needle')
          .attr('d', this.mkCmd(perc));
      };

      Needle.prototype.animateOn = function(el, perc) {
        let self;
        self = this;
        return el
          .transition()
          .delay(6000)
          .ease('elastic')
          .duration(10000)
          .selectAll('.needle')
          .tween('progress', function() {
            return function(percentOfPercent) {
              let progress;
              progress = percentOfPercent * perc;
              return d3.select(this).attr('d', self.mkCmd(progress));
            };
          });
      };

      Needle.prototype.mkCmd = function(perc) {
        let centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
        thetaRad = percToRad(perc / 2);
        centerX = 0;
        centerY = 0;
        topX = centerX - this.len * Math.cos(thetaRad);
        topY = centerY - this.len * Math.sin(thetaRad);
        leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
        leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
        rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
        rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
        return 'M ' + leftX + ' ' + leftY + ' L ' + topX + ' ' + topY + ' L ' + rightX + ' ' + rightY;
      };

      return Needle;
    })();

    if (props.needle) {
      needle = new Needle((height * 0.5) - barWidth, 5);
      needle.drawOn(chart, 0);
      needle.animateOn(chart, percent);
    }
  }
};

class Gauge extends Component {
  constructor(props) { 
    super(props)

    const x = () => {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    const key = x()
    this.state = {
      key: key
    }
  }

  componentDidMount() {
    const { props } = this
    const { key } = this.state
    let gauge = new drawGauge(props, key);
    gauge.draw()
  }

  render() {
    const { key } = this.state;
    const { width } = this.props;
    return (
      <span>
        <div style={{width: width, display: 'inline'}} className={key} />
      </span>
    );
  }
}

Gauge.defaultProps = {
  width: 300,
  height: 150,
  percent: 50,
  barWidth: 20,
  needle: true,
  areaRatios: [1.5/3, 0.5/3, 1/3],
  colors: ['#d6d9ea', '#f9c877', '#69b857'],
  needleColor: 'red'
};

Gauge.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  percent: PropTypes.number,
  barWidth: PropTypes.number,
  areaRatios: PropTypes.array,
  colors: PropTypes.array,
  needleColor: PropTypes.string,
  needle: PropTypes.bool
};

export default Gauge;
