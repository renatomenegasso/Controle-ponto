hrs = window.hrs || {};

hrs.dao = (function($, helpers){
	var public = {};
	
	var SETTINGS_KEY = 'settings';
	
	var settings = null;
	
	function init(){
		settings = public.loadSettings();
	}
	
	function toDate(str){
		return (str != '' && str != undefined) ? new Date(parseInt(str)) : '';
	}
	
	function getDefaultLunchInfo(dateTime, info){
		var time = dateTime.getTime();
		var lunchStart = new Date(time),
			lunchEnd = new Date(time);
		
		var startHour = 12;
		var endHour = startHour + settings.lunchTime;
		
		var endMinute = (endHour - parseInt(endHour)) * 60;
		
		lunchStart.setHours(startHour);
		lunchEnd.setHours(endHour, endMinute);
		
		info.ida_almoco = lunchStart;
		info.volta_almoco = lunchEnd;
		info.almoco = helpers.dateTime.getTimeDiff(lunchEnd, lunchStart);
	}
	
	public.getDateInfo = function(dateTime){
		if(typeof dateTime == 'string')
			dateTime = new Date(parseInt(dateTime));

		var info = $.evalJSON(localStorage.getItem(dateTime.getTime()));
		
		if(info != null){
			info.entrada = toDate(info.entrada);
			info.saida = toDate(info.saida);
			
			info.ida_almoco = toDate(info.ida_almoco);
			info.volta_almoco = toDate(info.volta_almoco);
			
			info.holiday = getHoliday(dateTime);
			
			if(info.entrada != '' && info.saida != ''){
				if(info.ida_almoco == '' && info.volta_almoco == ''){
					getDefaultLunchInfo(dateTime, info);
				} else if (info.ida_almoco != '' && info.volta_almoco != '') {
					info.almoco = helpers.dateTime.getTimeDiff(info.volta_almoco, info.ida_almoco);
				} else {
					info.almoco = new hrs.timeStamp(settings.lunchTime * 60 * 60 * 1000);
				}
				
				info.total = helpers.dateTime.getTimeDiff(info.saida, info.entrada);
				info.total.removeTimeStamp(info.almoco);
				
				info.extra = info.total.clone().addHours(getTotalWork(dateTime, info.holiday != null) * -1);
			} else {
				info.total = '';
				info.extra = '';
			}
			
			if(info.obs == undefined)
				info.obs = "";
			
			return info;
		}
		
		return {entrada:'', saida:'', ida_almoco: '',  volta_almoco: '', obs: '', holiday: getHoliday(dateTime), ausent: false};
	};
	
	public.storeDate = function(dateTime, data){
		data.entrada = (typeof(data.entrada) != 'undefined') ? data.entrada.getTime() : '';
		data.ida_almoco = (typeof(data.ida_almoco) != 'undefined') ? data.ida_almoco.getTime() : '';
		data.volta_almoco = (typeof(data.volta_almoco) != 'undefined') ? data.volta_almoco.getTime() : '';
		data.saida = (typeof(data.saida) != 'undefined') ? data.saida.getTime() : '';
		
		localStorage.setItem(dateTime.getTime(), $.toJSON(data));
	};
	
	public.saveSettings = function(newSettings){ 
		settings = newSettings;
		localStorage.setItem(SETTINGS_KEY, $.toJSON(newSettings)); 
		settings = public.loadSettings();
	};
	
	public.loadSettings = function(){ 
		var savedSettings = localStorage.getItem(SETTINGS_KEY);

		if(savedSettings == null || savedSettings == "")
			return {totalWork: 8, lunchTime: 1, holidays: []};
		
		savedSettings = $.evalJSON(savedSettings);
		savedSettings.lunchTime = parseFloat(savedSettings.lunchTime);
		savedSettings.totalWork = parseFloat(savedSettings.totalWork);
		
		return savedSettings; 
	};
	
	public.getHolidays = function(){
		return settings.holidays;
	};
	
	function getTotalWork(date, isHoliday){
		return (helpers.dateTime.isWeekend(date) || isHoliday) ? 0 : settings.totalWork;
	}
	
	function getHoliday(date){
		for(var i = 0; i < settings.holidays.length; i ++){
			var holiday = settings.holidays[i].date.split('/');

			if(date.getDate() == parseInt(holiday[0]) && date.getMonth() + 1 == parseInt(holiday[1]))
				return settings.holidays[i];
		}
		
		return null;
	}
	
	public.calculateTotals = function(month){
		var totalExtra = 0,
			totalTime = 0,
			extraMonth = 0,
			totalMonth = 0;
		
		for(var k in localStorage){
			if(isNaN(k))
				continue;
			
			var dt = new Date(parseInt(k));
			
			var info = public.getDateInfo(k);
			
			if(info.ausent){
				var totalDay = getTotalWork(dt, info.holiday != null) * 60 * 60 * 1000;
				if(dt.getMonth() == month){
					extraMonth -= totalDay;
					totalMonth -= totalDay;
				}
				
				totalTime -= totalDay;
				totalExtra -= totalDay;
				continue;
			}
			
			if(info.total == "") continue;
			
			if(info.entrada.getMonth() == month){
				extraMonth += info.extra.getTime();
				totalMonth += info.total.getTime();
			}
			
			totalTime += info.total.getTime();
			totalExtra += info.extra.getTime();
		}
		
		return {
			'extra' : new hrs.timeStamp(totalExtra),
			'extraMonth': new hrs.timeStamp(extraMonth),
			'total' : new hrs.timeStamp(totalTime),
			'totalMonth' : new hrs.timeStamp(totalMonth)
		};
	};
	
	public.exportData = function(){
		return $.toJSON(localStorage);
	};
	
	public.importData = function(data){
		if(typeof data == 'string') data = $.evalJSON(data);
		
		for(var k in data){
			localStorage[k] = data[k];
		}
		
		public.loadSettings();
	};
	
	init();
	
	return public;
	
})(jQuery, hrs.helpers);