// ideas for preventing crash...
// evaluate the fitness on the validation set for each after the run... there's no need to be doing those computations in the evolutionary loop

GP.prototype.select = function(r,tsize,point,gen,tempGen){
	var t = [];
	if(tempGen.length !== 0)
		var generation = tempGen;
	else 
		generation = ithis.generations[gen];
	_.times(tsize,function(){
		randSelection = _.random(point-r,point+r);
		if(randSelection < 0)
			randSelection = generation.length-1 + randSelection
		else if(randSelection > generation.length)
			randSelection = randSelection-generation.length;
		if(generation[randSelection])
			t.push(generation[randSelection]);
	});
	return _.min(t,function(ind){return ind.error;}).program;
}

GP.prototype.makeGens = function(gen,genPop){
	var ithis = this;
	
	if(gen > this.settings.stopAt || this.bestError < this.settings.errorCutoff){

		//window.population = _.flatten(this.generations,true);	
		window.maybe = [];
		window.population = _.map(_.flatten(this.generations,true),function(ind){
			if(ind.generation > (ithis.settings.stopAt / 1.68)){
				ind.fullError = ithis.error(ind.program,ithis.completeXs,ithis.completeYs);
				window.maybe.push(ind);
			}else
				ind.fullError = Infinity;
			return ind;
		});	

		//var medianError = _.median(_.pluck(_.sampleArray(window.population,0.3),"error"));
		//console.log("median error:" + medianError);
		// _.each(this.generations,function(generation){
		// 	_.each(generation,function(ind){
		// 		if(ind.program && ind.error < medianError)
		// 			ind.validateError = ithis.error(ind.program,ithis.validateXs,ithis.validateYs);
		// 	});
		// });
		
		// window.popWithValidate = _.filter(window.population,function(ind){
		// 	return _.has(ind,"validateError");
		// });
		//console.log(popWithValidate);
		this.settings.onComplete();

		return;
	}
	
	this.generations[gen] = [];
	var tempGen = [];

	if(gen >= (ithis.settings.stopAt/2.25))
		var generation = this.generations[gen];
	else
		var generation = tempGen;

	//every generation we're going to remove a random target value
	var remove = [];
	_.times(Math.round((Math.random() * 0.7) + 1),function(){remove.push(_.random(ithis.Ys.length))});
		filteredXs = [],
		filteredYs = [];
		_.each(_.range(this.Ys.length),function(i){
			if(!_.contains(remove,i)){
				filteredXs.push(ithis.Xs[i]);
				filteredYs.push(ithis.Ys[i]);
			}
		});

	// var filteredXs = [],
	// var filteredYs = [];	

	// _.each(range(ithis.Ys.length-1),function(i){
	// 	if(Math.random() > 0.03){
	// 		filteredXs.push(ithis.Xs[i]);
	// 		filteredYs.push(ithis.Ys[i]);
	// 	}
	// });
	

	if(!genPop){
		_.each(_.range(this.settings.popsize),function(){
			var ind = ithis.randomCode(2);
			var _error = ithis.error(ind,filteredXs,filteredYs);
			var indObj = {
				program:ind,error:_error,
				size:ithis.codeSize(ind),
				generation:gen//,
				//validateError:ithis.error(ind,ithis.validateXs,ithis.validateYs)
			};

			if(gen >= (ithis.settings.stopAt/2.25))
				ithis.generations[gen].push(indObj);
			else{
				tempGen.push(indObj);
				ithis.generations[gen].push(_.omit(indObj,"program"));
			}
			
		});
	}else{
		_.each(genPop,function(ind){
			var _error = ithis.error(ind,filteredXs,filteredYs);
			var indCodeSize = ithis.codeSize(ind);
			_error = _error + (0.0011 * indCodeSize);
			var indObj = {
				program:ind,
				error:_error,
				size:indCodeSize,
				generation:gen//,
				//validateError:ithis.error(ind,ithis.validateXs,ithis.validateYs)
			};
			if(gen >= (ithis.settings.stopAt/2.25)){
				//indObj['validateError'] = ithis.error(ind,ithis.validateXs,ithis.validateYs);
				ithis.generations[gen].push(indObj);
			}else{
				tempGen.push(indObj);
				ithis.generations[gen].push(_.omit(indObj,"program"));
			}
		});
	}

	var nextGen = [];
	_.each(generation,function(ind,point){
		
		


		if(Math.random() > 0.5){
			nextGen.push(ithis.mutate(ithis.select(49,23,point,gen,tempGen)));
		}else{
			nextGen.push(ithis.crossover(ithis.select(49,23,point,gen,tempGen),ithis.select(49,23,point,gen,tempGen)));
		}

	});
	//console.log(nextGen);
	var best = _.min(generation,function(ind){return ind.error; });
	

	//console.log("=============");
	// console.log("Generation: " + gen);
	// console.log("Best: " + best.program);
	// console.log("Best size: " + best.size);
	// console.log("Best Error: " + best.error);
	
	this.bestError = best.error;
	

		setTimeout(function(){
			errorChart.addData(best.error);
			sizeChart.addData(best.size);
			$(".bar").css("width",(100* (gen/ithis.settings.stopAt)) + "%");
			document.querySelector("#bestProgram").innerHTML = best.program;
			document.querySelector("#bestProgram").offsetWidth;
			ithis.makeGens(gen+1,nextGen);
		},60);
	
		
	}