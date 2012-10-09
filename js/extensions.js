/**
 * Array
 */

(function(array) {
	array.max = function() { 
		return Math.max.apply(Math,this); 
	};
	
	array.min = function() {
		return Math.min.apply(Math, this);
	};
	
	array.insertAt = function(index, element) {
		for (var i = this.length; i > index; i--) {
			this[i] = this[i - 1];
		}
		
        this[index] = element;
        return this;
	};
	
	array.removeAt = function(index) {
		for (var i = index; i < this.length - 1; i++) {
			this[i] = this[i + 1];
		}
		
		this.length--;
		
		return this;
	};
}(Array.prototype));

/**
 * String
 */

(function(string) {
	string.replaceAll = function(oldVal, newVal) {
		return this.split(oldVal).join(newVal);
	};
	
	string.truncate = function(length, tail) {
		var suffix = tail || '...';
		
		if (typeof length == 'undefined') {
			throw new Error('Parâmetro size não definido');
		}
		
		return this.length <= length ? this : this.substr(0, length) + suffix;
	};
	
	var _withAcentuation = 'àèìòùâêîôûäëïöüáéíóúãõçÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÁÉÍÓÚÃÕÇ´`^¨~';
	var _withoutAcentuation = 'aeiouaeiouaeiouaeiouaocAEIOUAEIOUAEIOUAEIOUAOC     ';
	
	string.removeAcentuation = function() {
		var str = this;
		
		for(var i = 0; i < _withAcentuation.length; i ++){
			if(str.indexOf(_withAcentuation[i]) == -1) {
				continue;
			}
			
			str = str.replaceAll(_withAcentuation[i], _withoutAcentuation[i]);
		}
		
		return str;
	};
	
	
	string.capitalize = function() {
		var word = this.split(' ');
        
		for (var i = 0; i < word.length; i++) {
			word[i] = word[i].charAt(0).toUpperCase() + word[i].substring(1).toLowerCase();
		};
		
        return word.join("");
	};
	
	string.removeTags = function() {
		return this.replace(/<\/?[^>]+>/gi, '');
	};
	
	string.contains = function(str) {
		return this.indexOf(str) != -1; 
	};
}(String.prototype));