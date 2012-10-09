hrs = window.hrs || {};

hrs.timeStamp = function(milis){
	var public = {};
	var miliSeconds, seconds = 0, minutes = 0, hours = 0;
	
	miliSeconds = milis;
	
	public.getSeconds = function(){ return seconds; };
	public.getMinutes = function(){ return minutes; };
	public.getHours = function(){ return hours; };
	public.getTime = function(){ return miliSeconds; };
	
	public.addTimeStamp = function(timeStamp){
		miliSeconds += timeStamp.getTime();
		calculate();
	};
	
	public.removeTimeStamp = function(timeStamp){
		miliSeconds -= timeStamp.getTime();
		calculate();
	};
	
	public.addHours = function(hours){
		miliSeconds += (hours * 60 * 60 * 1000);
		calculate();
		return this;
	};
	
	public.addMinutes = function(minutes){
		miliSeconds += minutes * 60 * 1000;
		calculate();
		return this;
	};
	
	public.addSeconds = function(seconds){
		miliSeconds += seconds * 1000;
		calculate();
		return this;
	};
	
	public.clone = function(){
		return new hrs.timeStamp(miliSeconds);
	};
	
	public.toString = function() {
		return hrs.helpers.dateTime.formatDate(this, '#h:#m');
	};
	
	function calculate(){
		seconds = miliSeconds / 1000;
		minutes =  (seconds / 60) % 60;
		hours = (seconds / 60 - minutes) / 60;
	}
	
	calculate();
	
	return public;
};