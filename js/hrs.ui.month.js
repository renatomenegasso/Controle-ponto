hrs = window.hrs || {};
hrs.ui = window.hrs.ui || {};

hrs.ui.month = function(month, year) {
	var public = {};
	
	var _dao = null;
	
	var _helpers = hrs.helpers,
		_dateHelpers = hrs.helpers.dateTime;
	
	var _updatedRowCallback = null;

	var _contextmenu = null;

	function _getRowInfo(date){
		var dateInfo = _dao.getDateInfo(date);
		var observation = dateInfo.obs;
		if(observation == "" && dateInfo.holiday && dateInfo.holiday.obs != ""){
			observation = dateInfo.holiday.obs;
		}

		var formatedInfo = {
			data: _dateHelpers.formatDate(date, '#d/#M'),
			diaSemana: _dateHelpers.weekDay(date.getDay()),
			entrada: _dateHelpers.formatDate(dateInfo.entrada, '#h:#m'),
			ida_almoco: _dateHelpers.formatDate(dateInfo.ida_almoco, '#h:#m'),
			volta_almoco: _dateHelpers.formatDate(dateInfo.volta_almoco, '#h:#m'),

			saida: _dateHelpers.formatDate(dateInfo.saida, '#h:#m'),
			vpn: _dateHelpers.formatDate(dateInfo.vpn, '#h:#m'),
			total: _handleUndefinedDate(dateInfo.total),
			almoco: _handleUndefinedDate(dateInfo.almoco),
			excedente: _handleUndefinedDate(dateInfo.extra),
			checked: dateInfo.ausent ? 'checked="checked"' : '',
			holiday: dateInfo.holiday != null,
			obs : observation,
			cssObsPreenchida: (observation != "") ? ' filled' : ''
		};

		if(formatedInfo.entrada){
			var expectedExit = _calculateExpectedExit(dateInfo.entrada.getTime(), dateInfo.volta_almoco - dateInfo.ida_almoco);
			formatedInfo.expectedExit = _dateHelpers.formatDate(expectedExit, '#h:#m');
		} else {
			formatedInfo.expectedExit = '';
		}

		return formatedInfo;
	}

	function _calculateExpectedExit(start, lunchTime){
		var settings = _dao.loadSettings();
		if(!lunchTime || lunchTime < 0) lunchTime = settings.lunchTime * 60 * 60 * 1000;

		var ts = new hrs.timeStamp(start);
		
		ts.addTimeStamp(lunchTime);
		ts.addHours(settings.totalWork);

		var dt = new Date(ts.getTime());

		return dt;
	}
	
	function _handleUndefinedDate(date){
		return date == undefined ? '' : date.toString();
	}
	
	function _buildRow(date, $target, $template){
		var rowData = _getRowInfo(date);
		var cssClass = (date.getDay() % 2 != 0) ? 'even' : '';
		
		if(_dateHelpers.isWeekend(date)){
			cssClass += ' weekend';
		}
		
		if(rowData.holiday) {
			cssClass += ' holiday';
		}
			
		if(cssClass != '') {
			cssClass = 'class="' + cssClass + '"';
		}
		
		var rowContent = '<tr id="' + date.getTime() + '"' + cssClass + '>' + $template.html() + '</tr>';
		
		for(var k in rowData){
			rowContent = rowContent.split('{' + k + '}').join(rowData[k]);
		}
		
		var $rowContent = $(rowContent);
		$rowContent.find('input,textarea, .obs').change(changeEvent).blur(blurEvent).on('contextmenu',contextMenuEvent);
		$rowContent.find('.view-full-obs').click(showFullObs);
		
		$target.append($rowContent);
	}
	
	function changeEvent(e){
		var $row = $(e.target).closest('tr');
		var rowDate = new Date(parseInt($row.attr('id')));
		var isAusent =  $row.find('.ausent')[0].checked;

		var jsonInfo = {
			entrada: _dateHelpers.parseDateTime($row.find('.start').val(), rowDate),
			ida_almoco: _dateHelpers.parseDateTime($row.find('.lunch-start').val(), rowDate),
			volta_almoco: _dateHelpers.parseDateTime($row.find('.lunch-end').val(), rowDate),
			saida: _dateHelpers.parseDateTime($row.find('.end').val(), rowDate),
			vpn: _dateHelpers.parseDateTime($row.find('.vpn').val(), rowDate),
			obs: $row.find('.obs').text(),
			ausent: isAusent
		}

		_dao.storeDate(rowDate, jsonInfo);
		
		if(isAusent){
			$row.find('input[type!=checkbox]').attr('disabled', true);
		} else {
			$row.find('input[type!=checkbox]').removeAttr('disabled');
		}

		var info = _getRowInfo(rowDate);
		$row.find('.total').html(info.total);
		$row.find('.excedente').html(info.excedente);
		$row.find('.almoco').html(info.almoco);

		$row.find('.end').attr('placeholder', info.expectedExit);
		
		if(_updatedRowCallback != null) _updatedRowCallback($row, info);
	}	
	
	function blurEvent(e){
		var $input = $(e.target);
		var value = $input.val();
		
		if(value == "")
			return;
		
		if(value.indexOf(':') == -1){
			value +=  ':0';
		}
		
		value = value.replace(/[^\d:]/g, "");
		
		var arrTime = value.split(':');
		
		arrTime[0] = _helpers.number.addZeros(arrTime[0], 2);
		arrTime[1] = _helpers.number.addZeros(arrTime[1], 2);
		
		$input.val(arrTime.join(':'));
	}

	function contextMenuEvent(e){
		e.preventDefault();
		var $input = $(this),
			offset = $input.offset();

		if(!_contextmenu){
			_contextmenu = $("#input-context-menu");
		}

		_contextmenu.css({
			top: offset.top + 10,
			left: offset.left + 10
		}).fadeIn(100);

		$(document).mousedown(function(e){
			_contextmenu.fadeOut(100);
			$(document).off('click');
		});
	}

	function showFullObs(e){
		e.preventDefault();
		var offset = $(this).offset(),
			$boxObs = $('#box-obs');
		
		$boxObs.css({
			top: offset.top + 'px',
			left: offset.left + 'px'
		})
		.fadeIn()
		.find('textarea').val(this.title);
		
		$boxObs[0].refInput = $(this).closest('.obs_cell').find('.obs');
	}
	
	function hideBoxObs(e){
		e.preventDefault();
		$boxObs = $('#box-obs').fadeOut();
		var value = $boxObs.find('textarea').val(); 
		
		$boxObs[0].refInput 
			.html(value)
			.trigger('change')
			.parents('.obs_cell')
			.find('.view-full-obs')
			[ value == "" ? 'removeClass' : 'addClass' ]('filled')
			.attr('title', value);
		
	}
	
	public.setDao = function(dao){
		_dao = dao;
	};
	
	public.setUpdatedRowCallback = function(fn){
		_updatedRowCallback = fn;
	};
	
	public.print = function($target){
		var date = new Date(year, month, 1);
		var $tmpl = $("#row-template", $target);
		
		$target.find('tr:not(.fixed-row)').remove();
		while(date.getMonth() == month) {
			var actual = date.getDate();
			_buildRow(date, $target, $tmpl);

			date.setDate(actual + 1);

			//existe um bug que, ao adicionar um dia no dia 20/10, ele continua no dia 20/10, por isso soma-se mais um
			if(date.getDate() == actual){
				date.setDate(date.getDate() + 1);
			}
		}
		
		$('#box-obs .close-obs').click(hideBoxObs);
	};
	
	return public;
};

hrs.ui.month.static = (function(){
	function init(){
		contextMenu();
	}

	function contextMenu(){
		$(document).on('mousedown', '#insert-current-time', function(e){
			var dt = new Date();
			$(document.activeElement).val(dt.getHours() + ':' + dt.getMinutes()).trigger('change');
		});
	}

	init();
}());