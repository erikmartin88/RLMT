let width = 300,
    height = 300,
    start_angle = -1 * Math.PI / 3,
    end_angle = Math.PI / 3,
    domain = [0, 60],
    value = 46,
    target = 50,
    translate = `translate(${width/2},${0.85* height})`;

let svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    //.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

let text = svg.append("text")
         .datum({text: "00.00"})
          .attr("text-anchor", "middle")
          .attr("class", "reading")
          .text(d => d.text)
          .attr(
      "transform",
            `translate(${(width)/2}, ${height*0.25})`);

let back = d3.svg.arc()
          .innerRadius(width/2 - 70)
          .outerRadius(width/2 - 5)
          .startAngle(start_angle)
          .endAngle(end_angle);

let scale = d3.scale.linear()
              .range([start_angle, end_angle])
              .domain(domain);

let arc = d3.svg.arc()
          .innerRadius(width/2 - 70)
          .outerRadius(width/2 - 5)
          .startAngle(start_angle);

svg.append("path")
    .attr("class","arc-background")
    .attr("d", back)
    .attr("transform", translate);

let arcPath = svg.append("path")
    .datum({endAngle: scale(0)})
    .attr("class","arc")
    .attr("d", arc)
    .attr("transform", translate);

svg.append("circle")
    .attr("r", 10)
    .attr("class","pointer")
    .attr("transform", translate);

let needle = svg.append("rect")
    .attr("width", 8)
    .attr("height", 160)
    .attr("class","pointer")
    .attr(
      "transform",
      needleTransform(0)
    );

svg.append("line")
    .attr("class", "target")
    .attr("x1", 0)
    .attr("y1", 75)
    .attr("x2", 0)
    .attr("y2",150)
.attr(
      "transform",
      `translate(${(width-2)/2}, ${height*0.85}) rotate(${(scale(target) * 180 / Math.PI ) + 180} 0 0)`
    );

function needleTransform(angle = 0) {
  return `translate(${(width-5)/2}, ${height* 0.85}) rotate(${(scale(angle) * 180 / Math.PI ) + 180} 3.5 0)`
}

function arcTween(transition, newAngle) {
  transition.attrTween("d", function(d) {
    let interpolate = d3.interpolate(d.endAngle, newAngle);
    
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    }
  });
  
  transition.attrTween("class", function(d) {
    let interpolate = d3.interpolate(d.endAngle, newAngle);
    
    return function(t) {
      let m = scale.invert(interpolate(t)),
          classes = "";
      
      if (m < 40) classes = "low";
      else if (m >= 40 && m < 45) classes = "medium";
      else if (m >= 45 && m < 50) classes = "good";
      else if (m >= 50) classes = "very-good";

      return `arc ${classes}`;
    }
  });
}

function numTween(transition, newAngle) {
  transition.tween("text", function(d) {
    let interpolate = d3.interpolate(d.text, newAngle);
    
    return function(t) {
      d.text = interpolate(t);
      return d;
    }
  });
}

setTimeout(() => {
  arcPath.transition()
      .duration(1500)
      .call(arcTween, scale(value));
  
  needle.transition()
      .duration(1500)
      .attrTween("transform", function(d, i, a) {
    return d3.interpolateString(a, needleTransform(value));
  });
  
  text.transition()
    .duration(1500)
  .tween("text", function(d) {
    let i = d3.interpolateString(d.text, value);
    return function(t) {
      let str = String(i(t)).split(".");
      str[0] = ("0" + str[0]).slice(-2);
      str[1] = str[1] ? (str[1] + "0").slice(-2) : "00";
      this.textContent = str.join(".");
    };
  });
}, 300);