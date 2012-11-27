function chart(config) {
        
    // set default options
    var defaultOptions = {
        selector: '#chartZone',
        class: 'chart',
        id: null,
        data: [0],
        type: 'column', 
        width: 900,
        height: 200,
        callback: null,
        interpolate: 'monotone'
    };
    
    // fill in unspecified settings in the config with the defaults
    this.settings = $.extend(defaultOptions, config);
    this.w = this.settings.width,
    this.h = this.settings.height,
    this.barPadding = 0,
    this.scale = 10;
    this.svg = d3.select(this.settings.selector) // create the main svg container
            .append("svg")
            .attr("width",this.w)
            .attr("height",this.h);
    
}

chart.prototype.draw = function () { // generate chart with this function        
        
            
        this.max = d3.max(this.settings.data);
        
         

         this.y = d3.scale.linear().range([this.h,0]),
            this.yAxis = d3.svg.axis().scale(this.y).ticks(5).orient("left"),
            this.x = d3.scale.linear().range([0, this.w]);

        this.y.domain([0, this.max]).nice();
        this.x.domain([0, this.settings.data.length]).nice();

         this.rect = this.svg.selectAll("rect")
           .data(this.settings.data, function(d,i) {return i;});

        var innerThis = this;
        this.rect.enter().append("rect")
           .attr("x", function(d,i) {return innerThis.x(i);})
           .attr("y", function(d,i) {return innerThis.y(d);})
           .attr("width", this.w / this.settings.data.length - this.barPadding)
           .attr("height", function(d) {return innerThis.h - innerThis.y(d);})
           .attr("fill", "rgb(90,90,90)");
                      
        this.svg.append("svg:g")
           .attr("class", "y axis")
           //.attr("transform", "translate(-4,0)")
           .call(this.yAxis);        
                   


    
       // setInterval(function(){addData(Math.round(Math.random() * 30));},2000);
      }

chart.prototype.addData = function(_y) {
            var newData = [];
                        
            newData = this.settings.data;
            newData.push(_y);
            
            this.settings.data = newData;
            newMax = d3.max(newData);
            
            this.y.domain([0, newMax]).nice();
            this.x.domain([0, newData.length]).nice();  
            
            var t = this.svg.transition().duration(0);
            
            t.select(".y.axis").call(this.yAxis);
            
            this.svg.selectAll("rect").attr("fill", "rgb(100,100,100)");
            var newrect = this.svg.selectAll("rect")
                .data(newData, function(d,i) {return i;});
            var innerThis = this;

            newrect.enter().append("rect")
               .attr("fill", "rgb(0,100,0)");               
            newrect.transition().duration(0)
               .attr("x", function(d,i) {return innerThis.x(i);})
               .attr("y", function(d,i) {return innerThis.y(d);})
               .attr("width", this.w / newData.length - this.barPadding)
               .attr("height", function(d) {return innerThis.h - innerThis.y(d);});
            newrect.exit()
                .attr("fill", "rgb(100,0,0)")
              .transition().duration(750)
                .style("fill-opacity",1e-6)
                .remove();
        }
