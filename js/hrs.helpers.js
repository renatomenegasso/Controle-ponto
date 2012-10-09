hrs = window.hrs || {};
hrs.helpers = window.hrs.helpers || {};

hrs.helpers.number = {
	addZeros: function(val, count){
		val = val.toString();
		while(val.length < count)
			val = '0' + val;
		return val;
	}
};

hrs.helpers.dateTime = (function(helpers){
	var weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
	 	months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
			
	var SAB = 6, DOM = 0;
	var public = {};
	
	var number = helpers.number;
	
	public.weekDay = function(n) {
		return weekDays[n];
	};
	
	public.isWeekend = function(date){
		return date.getDay() == SAB || date.getDay() == DOM;
	};
	
	public.formatDate = function(date, format) {
		if(date == null || typeof(date) != 'object')
			return '';

		var dateInfo = { d: date['getDate'] != undefined ? number.addZeros(date.getDate(), 2) : '',
					     MM: date['getMonth'] != undefined ? months[date.getMonth()] : '',
						 M: date['getMonth'] != undefined ? number.addZeros(date.getMonth() + 1, 2) : '',
						 yyyy: date['getFullYear'] != undefined ? number.addZeros(date.getFullYear(), 2) : '',
						 h: number.addZeros(Math.round(Math.abs(date.getHours())), 2),
						 m: number.addZeros(Math.round(Math.abs(date.getMinutes())), 2),
						 s: number.addZeros(Math.round(Math.abs(date.getSeconds())), 2) };
		
		var result = format;
		
		for(var i in dateInfo){
			result = result.split('#' + i).join(dateInfo[i]);
		}
		
		if(date.getTime() < 0){
			result = '-' + result;
		}
		
		return result;
	};
	
	public.parseDateTime = function(time, baseDate){
		if(time == '')
			return;
			
		var arrTime = time.split(':');
		
		if(arrTime.length == 1)
			arrTime.push(0);
		
		
		return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), arrTime[0], arrTime[1]);
	};
	
	public.getTimeDiff = function(d1, d2){
		return new hrs.timeStamp(d1 - d2);
	};
	
	return public;
	
})(hrs.helpers);


hrs.helpers.io = (function(){
	var exports = {};
	
	exports.key = {BACKSPACE: 8, TAB: 9, SHIFT: 16, CTRL: 17, ENTER: 13, HOME: 36, END: 35, DELETE: 46};
	
	exports.isSpecialKey = function(keyCode){
		for(var k in exports.key){
			if(exports.key[k] == keyCode)
				return true;
		}
		return false;
	};
	
	return exports;
})();