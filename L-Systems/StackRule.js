function StackRule(sym, push){

	if(sym.length > 1) throw "Symbol too Long!";

	var Symbol = sym;

	var Push = push == true ? true : false;

	this.getSymbol = function(){
		return Symbol.valueOf();
	}

	this .getPush = function(){
		return Push;
	}

}