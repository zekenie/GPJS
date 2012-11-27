_.mixin({
	randNth:function(a){
		return a[_.random(a.length-1)];
	},
	getIndexes:function(needle,haystack){
		var output = [];
		_.each(haystack,function(letter,key){
			if(letter === needle)
				output.push(key);
		});
		return output;
	},
	median : function(obj, iterator, context) {
	    if (_.isEmpty(obj)) return Infinity;
	    var tmpObj = [];
	    if (!iterator && _.isArray(obj)){
	      tmpObj = _.clone(obj);
	      tmpObj.sort(function(f,s){return f-s;});
	    }else{
	      _.isArray(obj) && each(obj, function(value, index, list) {
	        tmpObj.push(iterator ? iterator.call(context, value, index, list) : value);
	        tmpObj.sort();
	      });
	    };
	    return tmpObj.length%2 ? tmpObj[Math.floor(tmpObj.length/2)] : (_.isNumber(tmpObj[tmpObj.length/2-1]) && _.isNumber(tmpObj[tmpObj.length/2])) ? (tmpObj[tmpObj.length/2-1]+tmpObj[tmpObj.length/2]) /2 : tmpObj[tmpObj.length/2-1];
	  },
	  sampleArray	:function(a,probability){
	  	var returnA = [];
	  	_.each(a,function(i){
	  		if(Math.random() < probability)
	  			returnA.push(i);
	  	});
	  	return returnA;
	  }
});

function sum(){
	return _.reduce(arguments,function(memo,x){ return x+memo; });
}
function subtract(){
	return _.reduce(arguments,function(memo,x){ return x-memo; });
}
function mult(){
	return _.reduce(arguments,function(memo,x){ return x * memo; });
}
function sin(){
	return Math.sin(arguments[0]);
}
function cos(){
	return Math.cos(arguments[0]);
}
function tan(){
	return Math.tan(arguments[0]);
}
function sqrt(){
	return Math.sqrt(Math.abs(arguments[0]));
}
function abs(){
	return Math.abs(arguments[0]);
}
function pd(){
	var a  = arguments;
	if(!a[1])
		a[1] = 1;
 	var numerator = _.first(a),
		denominator = a[1];
	if(Math.abs(denominator) < 0.0001 || denominator === null || denominator == NaN)
		denominator = 1;
	return numerator / denominator;
}
function mod(a,b){
	return a%b;
}

function GP(parameters){

	//default settings
	this.settings = {
		terminalProbability		: 		0.5,
		variableVsConstant		:		0.5,
		stopAt					:		100,
		percentCrossover		: 		0.45,
		percentMutation			: 		0.45,
		percentCloning			: 		0.05,
		percentValidation 		: 		0.4,
		tournamentSize			: 		7,
		constants 				: 		["random"],
		popsize 				: 		150,
		errorCutoff 			: 		0.01,
		targetData				: 		[],
		terminals 				: 		["x"],
		functionTable 			: 		{},
		yTransformationFn		: 		function(y){return Math.log(y) / Math.log(10);},
		onComplete 				: 		function(){ return true; }
	};

	//extend defaults with custom settings... replaces vals with the ones passed.
	this.settings = _.extend(this.settings,parameters);

		this.bestProgram;
		this.stop = false;
		this.bestError = 999999;
		this.generations = [];
		
		this.Xs = [];
		this.Ys = [];
		this.validateXs = [];
		this.validateYs = [];
		this.completeXs = [];
		this.completeYs = [];
		var ithis = this;
	_.each(this.settings.targetData,function(r){
		ithis.completeXs.push(_.initial(r));
		ithis.completeYs.push(_.last(r));
		if(Math.random() > ithis.settings.percentValidation){
			ithis.Xs.push(_.initial(r));
			ithis.Ys.push(_.last(r));
		}else{
			ithis.validateXs.push(_.initial(r));
			ithis.validateYs.push(_.last(r));
		}
	});

	this.Ys = _.map(this.Ys,this.settings.yTransformationFn);
	this.validateYs = _.map(this.validateYs,this.settings.yTransformationFn);
	this.completeYs = _.map(this.completeYs,this.settings.yTransformationFn);
}

GP.prototype.randomFunction = function(){
	return _.randNth(_.keys(this.settings.functionTable));
}

GP.prototype.randomTerminal = function(){
	// could be modified for multiple terminals
	if(Math.random() < this.settings.variableVsConstant || this.settings.constants.length === 0){
		return _.randNth(this.settings.terminals);
	}else{
		var randVal = _.randNth(this.settings.constants);
		if(randVal === "random")
			randVal = (Math.random() * 40) - 20
		return randVal;
	}
}

GP.prototype.randomCode = function(depth){

	if(depth == 0 || Math.random() < this.settings.terminalProbability)
		return this.randomTerminal();
	else{
			var fn = this.randomFunction()
				ithis = this,
				innerCode = "",
				numParams = this.settings.functionTable[fn];
				_.each(_.range(numParams),function(){
					innerCode += ithis.randomCode(depth-1) + ",";
				});
				innerCode = innerCode.slice(0,-1);
			return fn + "(" + innerCode + ")";
	}
}

GP.prototype._eval = function(code,Xs){
	if(!Xs)
		dataset = this.Xs;
	var terminalStr = "";
	_.each(this.settings.terminals,function(t){terminalStr += t + ",";});
	terminalStr = terminalStr.slice(0,-1);
	code = "function(" + terminalStr + "){ return  " + code + "; }";
	return eval('_.map(Xs,function(reaction){return (' + code + ').apply(this,reaction)});');
}

GP.prototype.error = function(individual,Xs,Ys){
	if(!Ys)
		Ys = this.Ys;
	if(!Xs)
		Xs = this.Xs;
	var indSeq = this._eval(individual,Xs),
		ithis = this;
	return _.reduce(
				_.map(Ys,function(val,key){
					return Math.abs(val - indSeq[key]);
				}),
				function(memo,x){return x+memo;}
			) / Xs.length;
}

GP.prototype.codeSize = function(code){
	return _.getIndexes("(",code).length;
}

GP.prototype.atIndex = function(treeStr,point){
	var startParen = _.getIndexes("(",treeStr)[point],
		i = startParen + 1,
		endParen = null,
		numComma = null;

	for(var parenCount=0; parenCount >= 0;i++){
		if(parenCount === 0 && treeStr[i] === ",")
			numComma++;
		if(treeStr[i] === "(")
			parenCount++;
		if(treeStr[i] === ")")
			parenCount--;
		if(parenCount === 0)
			endParen = i;
	}
	var numExp = numComma+1;
	return [startParen,endParen,numExp];
}

GP.prototype.mutate = function(i){
	var size = this.codeSize(i),
		ithis = this;
	if(size > 0){
		var indexes = this.atIndex(i,_.random(size-1));
		var newInd = i.slice(0,indexes[0]+1);
		_.each(_.range(indexes[2]),function(){
			newInd += ithis.randomCode(_.random(1,2)) + ",";
		});
		newInd = newInd.slice(0,-1);
		newInd += i.slice(indexes[1]+1,i.length);
		return newInd;
	}else	//if its a terminal, you can just make a new one.
		return this.randomCode(2);
}

GP.prototype.crossover = function(i,j){
	var sizeI = this.codeSize(i),
		sizeJ = this.codeSize(j);
	if(sizeI > 0 && sizeJ > 0){	
		var	partI = this.atIndex(i,_.random(sizeI-1)),
			partJ = this.atIndex(j,_.random(sizeJ-1)),
			newInd = i.slice(0,partI[0]+1);
			newInd += j.slice(partJ[0]+1,partJ[1]+1);
			newInd += i.slice(partI[1]+1,i.length);
		return newInd;
	}else{
		if(Math.random() < 0.5)
			return i;
		else
			return this.randomCode(2);
	}
}

GP.prototype.select = function (population,tournamentSize){
	var toReturn = _.min(_.map(_.range(this.settings.tournamentSize),function(){return _.random(population.length)}));
	return population[toReturn].program;
}

GP.prototype.makeGens = function(gen,genPop){
	
	if(gen > this.settings.stopAt || this.bestError < this.settings.errorCutoff){
		this.settings.onComplete();
		return;
	}
	var ithis = this;
	this.generations[gen] = [];
	if(!genPop){
		_.each(_.range(this.settings.popsize),function(){
			var ind = ithis.randomCode(2);
			var _error = ithis.error(ind);
			ithis.generations[gen].push({
				program:ind,error:_error,
				size:ithis.codeSize(ind),
				generation:gen,
				validateError:ithis.error(ind,ithis.validateXs,ithis.validateYs)
			});
			
		});
	}else{
		_.each(genPop,function(ind){
			var _error = ithis.error(ind);
			var indCodeSize = ithis.codeSize(ind);
			_error = _error + (0.02 * indCodeSize);
			ithis.generations[gen].push({
				program:ind,
				error:_error,
				size:indCodeSize,
				generation:gen,
				validateError:ithis.error(ind,ithis.validateXs,ithis.validateYs)
			});
		});
	}
	this.generations[gen] = this.generations[gen].sort(function(a,b){return a.error-b.error});
	
	var best = this.generations[gen][0];
	if(this.bestProgram){
		if(this.bestProgram.error > best.error)
			this.bestProgram = best;
	}else{
		this.bestProgram = best;
	}
	console.log("=============");
	console.log("Generation: " + gen);
	console.log("Best: " + best.program);
	console.log("Best size: " + best.size);
	console.log("Best Error: " + best.error);
	
	this.bestError = best.error;
	
		var nextGen = [];
		_.times(Math.round(this.settings.popsize * this.settings.percentMutation),function(){
			nextGen.push(ithis.mutate(ithis.select(ithis.generations[gen],ithis.settings.tournamentSize)));
		});
		_.times(Math.round(this.settings.popsize * this.settings.percentCrossover),function(){
			nextGen.push(ithis.crossover(ithis.select(ithis.generations[gen],ithis.settings.tournamentSize),ithis.select(ithis.generations[gen],ithis.settings.tournamentSize)));
		});
		_.times(Math.round(this.settings.popsize * this.settings.percentCloning),function(){
			nextGen.push(ithis.select(ithis.generations[gen],ithis.settings.tournamentSize));
		});
		setTimeout(function(){
			errorChart.addData(best.error);
			sizeChart.addData(best.size);
			$(".bar").css("width",(100* (gen/ithis.settings.stopAt)) + "%");
			document.querySelector("#bestProgram").innerHTML = best.program;
			document.querySelector("#bestProgram").offsetWidth;
			ithis.makeGens(gen+1,nextGen);
		},60);
	
		
	}

GP.prototype.evolve = function(){
	
	console.log("starting evolution.....");

	this.makeGens(0);
}
