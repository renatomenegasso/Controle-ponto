(function(){
	var context = {};

	function init(){
		render();
		$(document).bind('ballgamerendered', function(){
			animateBall();
			animateBar();
		});
	}

	function pos($elm, x, y){
		$elm.css({
			'left': x + 'px',
			'top': y + 'px'
		});
	}

	function posBall(x,y){
		var $elm = $(".ball");
		pos($elm, x - $elm.width() / 2, y - $elm.height() / 2);
	}

	function posBar(x,y){
		var $elm = $(".bar");
		pos($elm, x - $elm.width() / 2, y - $elm.height() / 2);
	}

	function render(){
		var $elm = $(['<div id="ball-wraper">',
							'<div class="bar-grid">',
								'<div class="reference">',
									'<div class="bar"></div>',
									'<div class="ball"></div>',
								'</div>',
							'</div>',
						'</div>'].join(''));

		var wrapperCss = {
			'position': 'fixed',
			'background': '#fff',
			'border': '6px solid #424242',
			'border-radius': '10px',
			'z-index': 9999,
			'width':'500px',
			'height': '500px',
			'left': '25%',
			'-webkit-box-shadow': '0px 11px 15px rgba(50, 50, 50, 0.75)',
			'display': 'none'
		}, gridCss = {
			'border':'3px solid #AAA',
			'border-radius': '200px',
			'width':'400px',
			'height':'400px',
			'margin': '45px 0 0 45px',
			'position': 'relative'
		}, barCss = {
			'font-size': '0px',
			'width': '80px',
			'height': '7px',
			'background': '#77B71D',
			'position': 'absolute',
			'z-index': 2
		}, ballCss = {
			'width': '30px',
			'height': '30px',
			'background': '#f00',
			'border-radius': '15px',
			'position': 'absolute',
			'z-index': 1,
			'rotation-point': '50% 50%'
		}, referenceCss = {
			'top': '200px',
			'left': '200px',
			'position': 'relative',
			'width': '1px',
			'height': '1px',
			background:"black"
		};

		$elm.css(wrapperCss)
			.find('.bar-grid').css(gridCss)
			.find('.reference').css(referenceCss)
			.find('.bar').css(barCss)
			.siblings('.ball').css(ballCss);

		$("body").append($elm.fadeIn('fast', function(){
			$(document).trigger('ballgamerendered');
		}));		
	}

	function animateBall(){
		posBall(0,0);

		var angle = Math.random() * (Math.PI * 2) /*Math.PI * 2*/,
			area = $('.bar-grid'),
			limitX = area.width() / 2,
			limitY = area.height() / 2,
			speed = 1.5,
			reference  = $(".reference").offset();

		var x = 0, y = 0;
		context.ballInterval = setInterval(function(){
			x += Math.cos(angle) * speed;
			y += Math.sin(angle) * speed;
			
			posBall(x,y);

			if($('.bar').hitTest($('.ball'))){
				speed *= -1;

				console.log('rebateu');
			}

			if(Math.abs(x) > limitX || Math.abs(y) > limitY){
				endGame();
				clearInterval(context.ballInterval);
			}
		}, 10);
	}

	function animateBar(gridWidth){
		var center = $(".reference").offset(),
			radius = $(".bar-grid").width() / 2;
		
		$(document).mousemove(function(e){
			var angulo = Math.atan2((e.clientY || 0) - center.top, (e.clientX || 0) - center.left);
			var x = Math.cos(angulo) * radius,
				y = Math.sin(angulo) * radius;

			posBar(x,y);
			rotateBar(angulo);
		});

		$(document).trigger('mousemove');
	}

	function rotateBar(angulo){
		var anguloFix = angulo + Math.PI / 2;
		var anguloEmGraus = Math.round(anguloFix * 180 / Math.PI);

		$(".bar").css('-webkit-transform', 'rotate(' + anguloEmGraus + 'deg)');
	}

	function endGame(){
		$('.ball').animate({width: 0, height: 0}, 500, function(){
			$("#ball-wraper").fadeOut(300, function(){
				alert('Game over!');
			});
		})
	}

	$(init);
}());


/*
 * jQuery "hitTest" plugin
 * @warning: does not work with elements that are "display:hidden"
 * @param {Number} x The x coordinate to test for collision
 * @param {Number} y The y coordinate to test for collision
 * @return {Boolean} True if the given jQuery object's rectangular bounds contain the point defined by params x,y
 */
(function($){
    $.fn.hitTest = function(other){
       
	    function getPositions( elem ) {
	        var pos, width, height;
	        pos = $( elem ).position();
	        width = $( elem ).width() / 2;
	        height = $( elem ).height();
	        return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
	    }

	    function comparePositions( p1, p2 ) {
	        var r1, r2;
	        r1 = p1[0] < p2[0] ? p1 : p2;
	        r2 = p1[0] < p2[0] ? p2 : p1;
	        return r1[1] > r2[0] || r1[0] === r2[0];
	    }

    	var pos1 = getPositions( this ),
        	pos2 = getPositions( other );

		return comparePositions( pos1[0], pos2[0] ) && comparePositions( pos1[1], pos2[1] );
	};
})(jQuery);