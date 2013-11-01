function ProductionRule(Pre, Suc, Prob){

	if(Pre.length > 1) throw "Predecessor Too Long!";

	var Predecessor = new String(Pre);
	var Successors = [];
	var Probabilities = [];
	var ProbabilityTotal = 0;
	Successors.push(new String(Suc));
	Probabilities.push(Prob);
	if(Prob != undefined)ProbabilityTotal += Prob;

	this.getPredecessor = function(){
		return Predecessor.valueOf();
	}

	this.getSuccessorCount = function (){
		return Successors.length;
	}
	this.getSuccessor = function(i){
		return Successors[i];
	}

	this.getProbability = function(i){
		return Probabilities[i];
	}
	this.getProbabilityTotal = function(){
		return ProbabilityTotal;
	}

	this.addRule = function(Pre, Suc, Prob){
		if(Pre != Predecessor) throw "Not the same Predecessor!";
		if(Probabilities[0] == undefined) throw "Previous Rule's Probability not Defined";
		if((ProbabilityTotal + Prob) > 1) throw "Total Probability is over 100%";
		Successors.push(new String(Suc));
		Probabilities.push(Prob);
		ProbabilityTotal += Prob;

	}

	this.checkSame = function(rule){
		if(rule.getPredecessor() == Predecessor.valueOf() && 
			rule.getSuccessors(0) == Successor[0].valueOf()){
			return true;
		}
	}
}