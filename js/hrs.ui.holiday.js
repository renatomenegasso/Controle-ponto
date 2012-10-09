hrs = window.hrs || {};
hrs.ui = window.hrs.ui || {};

hrs.ui.holidays = (function($, helpers){
	
	var public = {};
	
	var $elem = null,
		callback = null;
	
	public.init = function(settings){
		$elem = settings.$elem;
		
		callback = settings.callback;
		
		printHolidays(settings.holidays);
		setupInputs();
	};
	
	public.getHolidays = function(){
		var holidays = [];
		
		$elem.find('tr').each(function(){
			var $t = $(this);
			var date = $t.find('.holiday_date').val(),
				obs =  $t.find('.holiday_description').val();
			
			if(date == "" || date == undefined)
				return;
			
			holidays.push({
				'date': date,
				'obs': obs
			});
		});

		holidays.sort(sortDates);
		
		return holidays;
	};
	
	function sortDates(a, b){
		var arrA = a.date.split('/');
		var arrB = b.date.split('/');
		
		var d1 = new Date(1, arrA[1], arrA[0]);
		var d2 = new Date(1, arrB[1], arrB[0]);
		
		if(d1 > d2) return 1;
		else if(d1 < d2) return -1;
		
		return 0;
	}
	
	function printHolidays(holidays) {
		if(holidays == undefined)
			return;
		
		var $rowTemplate = $elem.find('tr:has(td):first');
		
		for(var i = 0; i < holidays.length; i ++){
			var $row = $rowTemplate.clone();
			
			$row.find('.holiday_date').val(holidays[i].date).mask('99/99');
			$row.find('.holiday_description').val(holidays[i].obs);
			
			$row.insertBefore($rowTemplate);
		}
		
	}
	
	function isDayMonth(date){
		return date.match(/^\d{2}\/\d{2}$/g);
	}
	
	function handleBlur($elm){
		var $row = $elm.closest('tr'),
			$fields = $row.find('input');
		
		var isEmpty = $fields.filter('[value!=""]').length == 0,
			isValid = isDayMonth($fields.filter('.holiday_date').val()),
			isLastLine = $row.next('tr').length == 0;
		
		if(isValid && isLastLine) addRow($row);
		
		if(isEmpty && !isLastLine){
			$row.remove();
		}
		
		if(callback != null)
			callback(public.getHolidays());
	}
	
	function setupInputs() {
		$elem.find('.holiday_date').mask('99/99');
		
		$elem.delegate('input', 'blur', function(e){
			var $elm = $(this);
			setTimeout(function(){
				handleBlur($elm);
			}, 10);
		});
	}
	
	function addRow($row){
		var $clone = $row.clone();
		$clone.find('input').val('').filter('.holiday_date').mask('99/99');
		$elem.append($clone);
	}
	
	return public;
	
})(jQuery, hrs.helpers);