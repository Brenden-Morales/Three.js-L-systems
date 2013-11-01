function LSystem(){

	//private lists of the components fundamental to the L-System
	var Variables = new Array();
	var Constants = new Array();
	var ProductionRules = new Array();
	var DrawingRules = new Array();
	var StackRules = new Array();

	//add variable
	this.addVariable = function (ch){
		if(ch.length > 1){
			throw "Too Long!";
		}
		else if(Variables.indexOf(ch) != -1){
			throw "Variable Already Exists!";
		}
		else if(Constants.indexOf(ch) != -1){
			throw "Variable already Defined in Constants!";
		}
		else if(Variables.indexOf(ch) == -1){
			Variables.push(ch);
		}
	}

	//add constant
	this.addConstant = function (ch){
		if(ch.length > 1){
			throw "Too Long!";
		}
		else if (Constants.indexOf(ch) != -1){
			throw "Constant Already Exists!";
		}
		else if (Variables.indexOf(ch) != -1){
			throw "Constant Already Defined in Variables!"
		}
		else if (Constants.indexOf(ch) == -1){
			Constants.push(ch);
		}
	}

	//define production rule
	this.defineProductionRule = function (rule){
		var successor = rule.getSuccessor(0);
		var predecessor = rule.getPredecessor();

		for(var i = 0; i < ProductionRules.length; i ++){
			if(ProductionRules[i].checkSame(rule)) throw "Production Rule Already Defined!";
		}

		//if this is a stochastic grammar, we need to loop through all possible predecessors
		for(var j = 0; j < rule.getSuccessorCount(); j ++){
			var CurrentSuccessor = rule.getSuccessor(j);
			for(var i = 0; i < CurrentSuccessor.length; i ++){
				var currentChar = CurrentSuccessor.charAt(i);
				if(Variables.indexOf(currentChar) == -1 && Constants.indexOf(currentChar) == -1) throw "Successor Character Not Defined!";
			}
		}
		
		//if this is a stochastic grammar we need to check to see if both of the values
		if(rule.getProbabilityTotal() != 0 && rule.getProbabilityTotal() != 1) throw "Probability does not add up to 100%!";

		if(Variables.indexOf(predecessor) == -1){
			throw "Predecessor Character Not Defined";
		}
		else{
			ProductionRules.push(rule);
		}

	}

	//define drawing rule
	this.defineDrawingRule = function (rule){
		var Symbol = rule.getSymbol();

		if(Variables.indexOf(Symbol) == -1 && Constants.indexOf(Symbol) == -1){
			throw "Symbol is Not Defined!";
		}

		for(var i = 0; i < DrawingRules.length; i ++){
			if(DrawingRules[i].checkSame(rule))throw "Drawing Rule Already Defined!";
		}

		DrawingRules.push(rule);
	}

	//define stack rule
	this.defineStackRule = function (rule){
		var Symbol = rule.getSymbol();

		if(Variables.indexOf(Symbol) == -1 && Constants.indexOf(Symbol) == -1){
			throw "Symbol is Not Defined!";
		}

		for(var i = 0; i < StackRules.length; i ++){
			if(StackRules[i].getSymbol() == Symbol) throw "Stack Rule Already Defined!";
		}

		StackRules.push(rule);

	}

	this.applyProductionRules = function (initialString){
		
		var ReturnString = "";

		while(initialString.length != 0){

			//check for a production rule
			for(var i = 0; i < ProductionRules.length; i ++){
				if(ProductionRules[i].getPredecessor() == initialString.charAt(0)){

					if(ProductionRules[i].getSuccessorCount() == 1){
						ReturnString = ReturnString.concat(ProductionRules[i].getSuccessor(0));
						initialString = initialString.substr(1);
						break;
					}
					else{
						//this is stochastic and we got's to worry about probabilities
						//but first, choose our value
						var ThisProbability = Math.random();
						var LowerBound = 0;
						var UpperBound = 0;
						for(var j = 0; j < ProductionRules[i].getSuccessorCount(); j ++){
							UpperBound += ProductionRules[i].getProbability(j);
							if(ThisProbability > LowerBound && ThisProbability < UpperBound){
								ReturnString = ReturnString.concat(ProductionRules[i].getSuccessor(j));
								initialString = initialString.substr(1);
								break;
							}
							LowerBound = UpperBound;
						}


					}
					
				}
			}

			//copy any constants over
			for(var i = 0; i < Constants.length; i ++){
				if(Constants[i] == initialString.charAt(0)){
					ReturnString = ReturnString.concat(Constants[i]);
					initialString = initialString.substr(1);
					break;
				}
			}

		}

		console.log(ReturnString);
		return ReturnString;

	}

	//converting degrees to radians
	function Deg2Rad(degrees){
		return degrees * (Math.PI / 180);
	}

	//drawring the system
	this.drawSystem = function (Drawstring, scene, forwardVector){

		//line stuff
		var material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } );
		var geometry = new THREE.Geometry();

		//stack
		var PositionStack = [];
		
		//vector going straight up / "Y"
		var forward = forwardVector

		//current drawing start location
		var currentLocation = new THREE.Vector3(0, 0, 0);
		var previousLocation;
		geometry.vertices.push(currentLocation);


		while(Drawstring.length != 0){

			var rulefound = false;

			//check for a drawring rule
			for(var i = 0; i < DrawingRules.length; i ++){

				if(DrawingRules[i].getSymbol() == Drawstring.charAt(0)){
					Drawstring = Drawstring.substr(1);
					rulefound = true;

					if(DrawingRules[i].getDraw()){
						var nextLocation = new THREE.Vector3(0, 0, 0).addVectors(currentLocation, forward);
						geometry.vertices.push(nextLocation);
						previousLocation = currentLocation;
						currentLocation = nextLocation;
						//rendering "pieces" so we need to set the new start point of the next line segmentwd
						geometry.vertices.push(currentLocation);
					}
					else if(DrawingRules[i].getRotate()){
						var rads = Deg2Rad(DrawingRules[i].getDegrees());
						forward.applyAxisAngle(DrawingRules[i].getAxis(), rads);
					}

				} //if a drawing rule is found

			} //checking for a drawing rule

			//check for a stack rule
			if(!rulefound){

				for(var i = 0; i < StackRules.length; i ++){

					if(StackRules[i].getSymbol() == Drawstring.charAt(0)){
						Drawstring = Drawstring.substr(1);
						rulefound = true;

						//if push
						if(StackRules[i].getPush()){
							//push the 2 values
							PositionStack.push(new THREE.Vector3(previousLocation.x, previousLocation.y, previousLocation.z));
							PositionStack.push(new THREE.Vector3(forward.x, forward.y, forward.z));
							//console.log("pushed");
						}
						else{
							//this is a pop
							geometry.vertices.pop();
							forward = PositionStack.pop();
							currentLocation = PositionStack.pop();
							geometry.vertices.push(currentLocation);
							//console.log("popped");
						}
					}
				}
			}

			//nothing found, remove character
			if(!rulefound){
				Drawstring = Drawstring.substr(1);
			}
			

		} // end of big while loop

		var Line = new THREE.Line(geometry, material, THREE.LinePieces);
		scene.add(Line);

	}

}