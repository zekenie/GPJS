function scatterplot(params){
	this.settings = {
		selector:"body",
		margin:{top: 40, right: 0, bottom: 40, left: 0},
		width: 850,
		height:500,
		eachDotClass:"",
		eachDotParam:["o"],
		_class: "dot chart",
		data: [],
		xLab:"x axis",
		yLab:"y axis",
		r:2
	};
	this.settings = $.extend(this.settings,params);

	
}



function pad(scale, k) {
  var range = scale.range();
  if (range[0] > range[1]) k *= -1;
  return scale.domain([range[0] - k, range[1] + k].map(scale.invert)).nice();
}

scatterplot.prototype.setup = function(){
	 this.svg = d3.select(this.settings.selector).append("svg")
	    .attr("width", this.settings.width)
	    .attr("height", this.settings.height)
	    .attr("class", "dot chart")
	  .append("g")
	    .attr("transform", "translate(" + this.settings.margin.left + "," + this.settings.margin.top + ")");
}

scatterplot.prototype.draw = function(){
	var innerThis = this;
	this.x = pad(d3.scale.linear()
	    .domain(d3.extent(this.settings.data, function(d) { return d.x; }))
	    .range([0, this.settings.width - this.settings.margin.left - this.settings.margin.right]), 7);

	this.y = pad(d3.scale.linear()
	    .domain(d3.extent(this.settings.data, function(d) { return d.y; }))
	    .range([this.settings.height - this.settings.margin.top - this.settings.margin.bottom, 0]), 7);

	this.xAxis = d3.svg.axis()
		.scale(this.x)
		.orient("bottom")
		.tickPadding(8);

	this.yAxis = d3.svg.axis()
		.scale(this.y)
		.orient("left")
		.tickPadding(8);


	this.svg.selectAll(".dot")
		.data(this.settings.data)
		.enter().append("circle")
		.attr("class",function(d){var returnV = "dot "; if(d.class) returnV += d.class; return returnV;})
		.attr("data-i",function(d,i){ return i; })
		.style("fill",function(d){if(d.color) return d.color})
		.attr("cx",function(d){ return innerThis.x(d.x); })
		.attr("cy",function(d){ return innerThis.y(d.y); })
		.attr("r",this.settings.r);

	

	this.svg.append("g")
		.attr("class","x axis")
		.attr("transform","translate(0," + this.y.range()[0]  +")")
		.call(this.xAxis);

	this.svg.append("g")
		.attr("class", "y axis")
		.call(this.yAxis);

	this.svg.append("text")
	    .attr("class", "x ")
	    .attr("text-anchor", "end")
	    .attr("x", this.settings.width - this.settings.margin.right - this.settings.margin.left)
	    .attr("y", this.settings.height - this.settings.margin.top - this.settings.margin.bottom - 6)
	    .text(this.settings.xLab);

	this.svg.append("text")
	    .attr("class", "y")
	    .attr("text-anchor", "end")
	    .attr("y", 6)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text(this.settings.yLab);

}

scatterplot.prototype.addPoint = function(point){
	this.settings.data.push(point);
	$(this.settings.selector).empty();
	this.setup();
	this.draw();
}