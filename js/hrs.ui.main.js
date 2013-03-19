hrs = window.hrs || {};
hrs.ui = window.hrs.ui || {};

hrs.ui.main = (function($, helpers, dao){
	var public = {};
	
	var currentDate = null,
		currentMonth = null,
		$container = null,
		lightboxIndex = 3;
	
	public.init = function($elm){
		$container = $elm;
		currentDate = new Date();
		buildMonth();
		settings();
		lightbox();
		monthInformation();
		importExport();
		holidays();
		exportPdf();
	};
	
	function buildMonth(){
		currentMonth = new hrs.ui.month(currentDate.getMonth(), currentDate.getFullYear());
		currentMonth.setDao(dao);
		currentMonth.setUpdatedRowCallback(updateInfo);
		currentMonth.print($container);
		
		$("#main-table tr").each(function(){
			var $row = $(this);
			formatValue($row.find('.total, .excedente'), $row.find('.excedente').html());
		});
		
		updateInfo();
	}
	
	function updateInfo($row, rowData){
		var totals = dao.calculateTotals(currentDate.getMonth(), currentDate.getFullYear());
		$("#extra").html(totals.extra.toString());
		$("#extra-month").html(totals.extraMonth.toString());
		$("#month-name").html(helpers.dateTime.formatDate(currentDate, '#MM / #yyyy'));
		
		formatValue($("#extra"), totals.extra.toString());
		formatValue($("#extra-month"), totals.extraMonth.toString());
		
		if(rowData != undefined){
			formatValue($row.find('.total, .excedente'), rowData.excedente);
		}
		
		$("#entrance-avg").html(helpers.dateTime.formatDate(totals.avgEntrance, '#hh#m'));
		$("#exit-avg").html(helpers.dateTime.formatDate(totals.avgExit, '#hh#m'));

		if(totals.totalExtraDays >= 0){
			$("#positive-days")
				.show()
				.find("#days-off").html(totals.totalExtraDays);

			$("#negative-days").hide();
		} else {
			$("#negative-days")
				.show()
				.find("#days-to-pay").html(totals.totalExtraDays);
				
			$("#positive-days").hide();
		}

		$("#ausent-days").html(totals.ausentDays);
	}
	
	function formatValue($target, value) {
		var isNegative = (typeof value == 'string') ? value.indexOf('-') > -1 : value < 0; 
		
		var fn = isNegative ? 'addClass' : 'removeClass';
		$target[fn]('negative-hours');
	}
	
	function settings(){
		var settings = dao.loadSettings();
		$("#total-work").val(settings.totalWork).change(saveSettings);
		$("#lunch-time").val(settings.lunchTime).change(saveSettings);
		$("#initial-balance").val(settings.initialBalance).change(saveSettings);

		var $utilDaysChecks = $("div.utilDays input:checkbox");
		for(var i = 0; i < settings.utilDays.length; i ++){
			$utilDaysChecks.filter('[value=' + settings.utilDays[i] + ']').attr('checked', 'checked');
		}

		$utilDaysChecks.change(saveSettings);
	}
	
	function openLightbox(id){
		var $elm = $(id); 
		$elm.fadeIn().css('z-index', lightboxIndex ++);
		
		var l = ($(window).width() - $elm.width()) / 2,
			t = ($(window).height() - $elm.height()) / 2;
		
		$elm.css({top: t+ 'px', left: l + 'px'});
	}
	
	function lightbox(){
		
		$('.open-lightbox').click(function(e){
			e.preventDefault();
			openLightbox($(this).attr('href'));
		});
		
		$('.lightbox .close').click(function(e){
			$(this).closest('.lightbox').fadeOut().css('z-index', 'auto');
		});
	}
	
	function saveSettings(e, holidays){

		var utilDaysChecked = [];

		$("input.utilDay:checked").each(function(){
			utilDaysChecked.push(this.value);
		});

		dao.saveSettings({
			'totalWork': $("#total-work").val(),
			'lunchTime': $("#lunch-time").val(),
			'initialBalance': $("#initial-balance").val(),
			'holidays': holidays || hrs.ui.holidays.getHolidays(),
			'utilDays': utilDaysChecked
		});

		buildMonth();
	}
	
	function monthInformation(){
		$("#prev-month").click(function(){
			currentDate.setMonth( currentDate.getMonth() - 1);
			buildMonth();
		});
		
		$("#next-month").click(function(){
			currentDate.setMonth( currentDate.getMonth() + 1);
			buildMonth();
		});
	}
	
	function saveImportedData(file){
		var fr = new FileReader();
        fr.onload = function(e){
        	var content = e.target.result;
    		dao.importData(content);
    		buildMonth();
        };
        
        fr.readAsText(file, 'UTF-8');
        setTimeout(function(){location.reload();}, 500);
	}
	
	function importExport(){

		$("#link-export").click(function(){
			$("#output-export").val(dao.exportData())[0].select();
		});

		$("#output-export").click(function(){
			this.select();
		})

		$("#import-data").click(function(e){
			$("#inputfile-import-data").click();
		});
		
		$('#proced-import').click(function(){
			saveImportedData($("#confirm-import")[0].file);
		});

		$("#inputfile-import-data").change(function(e){
			var files = e.target.files;
			
			if(files.length == 0) return;
			$("#confirm-import")[0].file = files[0];
			$("#inputfile-import-data").val('');
			openLightbox("#confirm-import");
		});
	}

	
	function holidays(){
		hrs.ui.holidays.init({ $elem: $("#holidays-list"), 
							   holidays: dao.getHolidays(),
							   callback: function(holidays){
								   saveSettings(null, holidays);
							   }});
	}

	function exportPdf(){
		$("a.export-pdf").click(function(e){
			e.preventDefault();
			window.print();
		});
	}

	return public;
})(jQuery, hrs.helpers, hrs.dao);


$(function(){
	hrs.ui.main.init($("#main-table"));
})