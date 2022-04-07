/*
 * A circular gauge, inspired in part by http://bl.ocks.org/1499279 but with different
goals in mind. The approach taken here for rotating the pointer is using a rotational
transformation, which is easier to code and animate than redrawing the pointer line
as taken in tomerd's gauge.

This code is released under the MIT license.

Copyright (C) 2012 Matt Magoffin

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


//Start power gauge***********************************          
		var gauge = function(container, configuration) {
			var that = {};
			var config = {

				size						: 210,
				clipWidth					: 210,
				clipHeight					: 100,
				ringWidth					: 20,
				ringInset					: 20,
//				maxValue					: 3.5,
//				minValue					: -3.5,
		
				pointerWidth				: 10,
				pointerTailLength			: 5,
				pointerHeadLengthPercent	: 0.9,
				
				minValue					: -2.35,
				maxValue					: 2.35,				
				minAngle					: -90,
				maxAngle					: 90,
				
				transitionMs				: 4000,
				
				majorTicks					: 6,
                                ticks                                           : [ -2, -1, -0.5, 0.5, 1, 2],
                                tickData                                        :[0.21428571428, 0.214285, 0.18, 0.1436, 0.144, 0.130, 0.463],
				labelFormat					: d3.format(',g'),
				labelInset					: 15,
				
				arcColorFn					: d3.scale.ordinal().range(['#734D00', '#A17E3A', '#CFBA76','#FFFFBF','#ABD17D','#60A642','#177A0D'])//: d3.scale.ordinal().range(['#734D00', '#A17E3A', '#CFBA76','#FFFFBF','#ABD17D','#60A642','#177A0D'])    //d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
//                                arcColorFn : d3.scaleLinear()
//                                    .domain(d3.ticks(0, 7, 11))
//                                    .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598", "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"])
                                };
			var range = undefined;
			var r = undefined;
			var pointerHeadLength = undefined;
			var value = 0;
			
			var svg = undefined;
			var arc = undefined;
			var scale = undefined;
			var ticks = undefined;
			var tickData = undefined;
			var pointer = undefined;
		
			var donut = d3.layout.pie();
			
			function deg2rad(deg) {
				return deg * Math.PI / 180;
			}
			
			function newAngle(d) {
				var ratio = scale(d);
				var newAngle = config.minAngle + (ratio * range);
				return newAngle;
			}
			
			function configure(configuration) {
				var prop = undefined;
				for ( prop in configuration ) {
					config[prop] = configuration[prop];
				}
				
				range = config.maxAngle - config.minAngle;
				r = config.size / 2;
				pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);
		
				// a linear scale that maps domain values to a percent from 0..1
				scale = d3.scale.linear()
					.range([0,1])
					.domain([config.minValue, config.maxValue]);
				
				ticks = config.ticks;
                                //these breaks are for the scale from -3.5 to 3.5
				tickData = config.tickData;
        
//                                ticks = [-2, -1.5, -0.5, 0.5, 1, 2];
                                //these breaks are for the scale from -2.75 to 2.75
//                                tickData = [0.14285714285, 0.14285714285, 0.14285714285, 0.14285714285, 0.14285714285, 0.14285714285, 0.14285714285];
//				tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});
                                console.log(tickData)
                                
				// ticks = scale.ticks(config.majorTicks);
//				tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});
				
				arc = d3.svg.arc()
					.innerRadius(r - config.ringWidth - config.ringInset)
					.outerRadius(r - config.ringInset)
					.startAngle(function(d, i) {
						var ratio = d * i;
						return deg2rad(config.minAngle + (ratio * range));
					})
					.endAngle(function(d, i) {
						var ratio = d * (i+1);
						return deg2rad(config.minAngle + (ratio * range));
					});
                              
                            

			}
			that.configure = configure;
			
			function centerTranslation() {
				return 'translate('+r +','+ r +')';
			}
			
			function isRendered() {
				return (svg !== undefined);
			}
			that.isRendered = isRendered;
			
			function render(newValue) {

				svg = d3.select(container)
                                    .append('svg:svg')
                                    .attr('class', 'gauge')
                                    .attr('width', config.clipWidth)
                                    .attr('height', config.clipHeight);
                            
				var centerTx = centerTranslation();
				
				var arcs = svg.append('g')
                                    .attr('class', 'arc')
                                    .attr('transform', centerTx);
				
				arcs.selectAll('path')
                                    .data(tickData)
                                    .enter().append('path')
                                    .attr('fill', function(d, i) {
                                        return config.arcColorFn(d * i);
                                    })
                                    .attr("id", function(d, i) {
                                        return "label"+ i;
                                    })
                                    .attr('d',arc);

				var lg = svg.append('g')
                                    .attr('class', 'label')
                                    .attr('transform', centerTx);
       
                            
				lg.selectAll('text')
                                    .data(ticks)
                                    .enter()
                                    .append('text')
                                    .style("text-anchor","middle")      
                                    .attr('transform', function(d) {
                                        var ratio = scale(d);
                                        var newAngle = config.minAngle + (ratio * range);
                                        return 'rotate(' +newAngle +') translate(0,' +(config.labelInset - r) +')';
                                    })
                                    .text(config.labelFormat);
		
				var lineData = [ [config.pointerWidth / 2, 0], 
                                    [0, -pointerHeadLength],
                                    [-(config.pointerWidth / 2), 0],
                                    [0, config.pointerTailLength],
                                    [config.pointerWidth / 2, 0] ];
				var pointerLine = d3.svg.line().interpolate('monotone');
				var pg = svg.append('g')
                                    .data([lineData])
                                    .attr('class', 'pointer')
                                    .attr('transform', centerTx);
						
				pointer = pg.append('path')
					.attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
					.attr('transform', 'rotate(' +config.minAngle +')');
				

				
                                update(newValue === undefined ? 0 : newValue);
			
				//set the graph to update to same value on hover -- more fun
				d3.select(container + " svg")
					.on("mouseover", function(){
						console.log(container);
						console.log(app.resilienceVals[container]);
//                                                update(-3);
						update(app.resilienceVals[container]-config.maxValue/5);
						setTimeout(function() {
							update(app.resilienceVals[container]);
						}, 750);
						            
                                    //analytics event tracking
                                    ga('send', 'event', {
                                       eventCategory:"Resilient Land",        
                                       eventAction: "Gauge Interaction", 
                                       eventLabel: container
                                    });
					
				});
                                
//                            //Change labels
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == 2
//                                })
//                            .text("More")
//                            .style("font-size", "10px")
//                            
//                            
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == -2
//                                })
//                            .text("Less")
//                            .style("font-size", "10px")
//
//                            
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == -1
//                                })
//                            .text("");
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == -0.5
//                                })
//                            .text("Average")
//                            .attr("transform", "rotate(0) translate(0" +(config.labelInset - r) + ")")
//  
//                            .style("font-size", "10px");
//                    
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == 1
//                                })
//                            .text("")
//                            .attr("translate", )
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == 0.5
//                                })
//                            .text("");		
//                    
//                            //add arc curvature
//                            d3.selectAll("text")
//                                .filter(function(){ 
//                                  return d3.select(this).text() == 0.5
//                                })
//                            .text("");	
			}
			that.render = render;
			
			function update(newValue, newConfiguration) {
				console.log("updating");
				if ( newConfiguration  !== undefined) {
					configure(newConfiguration);
				}
				var ratio = scale(newValue);
				var newAngle = config.minAngle + (ratio * range);
				pointer.transition()
					.duration(config.transitionMs)
					.ease('elastic')
					.attr('transform', 'rotate(' +newAngle +')');
					
				// //add tooltip
				// var tooltip = d3.select(container)
					// .append("div")
					// .style("position", "absolute")
					// .style("z-index", "10")
					// .style("visibility", "hidden")
					// .text(tooltipText);
// 				
				// d3.select(id + " svg")
					// .on("mouseover", function(){return tooltip.style("visibility", "visible");})
					// .on("mousemove", function(){return tooltip.style("top", (event.pageY)+"px").style("left",(event.pageX-250)+"px");})
					// .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
			}
			that.update = update;
		
			configure(configuration);
			
			return that;
		};
//End power gauge***********************************