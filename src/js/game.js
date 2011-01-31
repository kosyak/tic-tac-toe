$.fn.textWidth = function(){
	var sensor = $('<div />').css({
		margin: 0,
		padding: 0
	});
	$(this).append(sensor);
	var width = sensor.width();
	sensor.remove();
	return width;
}
  
jQuery.switchStatus = function(oldStatus, newStatus) {
	newStatus = newStatus.split(' ')[0];
	if(oldStatus == newStatus) return oldStatus;
	var $info = $('#info');
	$info.fadeOut('fast', function() {
		switch (newStatus) {
			case 'lose':
				$info.text('You lose');
				$.setWinCells(newStatus);
				break;
			case 'moving':
				$info.text('Your turn');
				break;
			case 'win':
				$info.text('You win');
				$.setWinCells(newStatus);
				break;
			case 'waiting':
				$info.text("Waiting for...");
				break;
			case 'opponent_offline':
				$info.text("Opponent is offline");
				break;
		}
		$info.fadeIn('fast');
	});
	return newStatus;
};

jQuery.setWinCells = function(winString) {
	winString = winString.split(' ');
	while(winString.length > 0 && isNaN(parseInt(winString[0]))) winString.splice(0,1);
	var $this;
	for (var i = 0; i < winString.length/2; ++i) {
		$this = $('#gametable > table > tbody > tr:eq(' + (parseInt(winString[2*i+1])) + ') > td:eq(' + (parseInt(winString[2*i])) + ')');
		$this.css({'color' : 'red'});
	}
};

$(document).ready(function () {
	var size = 5;
	var $tbody = $('tbody');
	for(var i = 0; i<size; ++i) {
		var $tr = $('<tr></tr>');
		for(var j=0;j<size;++j) {
			$('<td></td>').appendTo($tr);
			}
		$tr.appendTo($tbody);
		}
	var tableSize = {
		width: size * $('td').outerWidth(),
		height: size * $('td').outerHeight()
	}; 
	
	$('#gametable > table').css({
		'left' : 0.5*Math.max($(window).width() - tableSize.width, 0)+'px', 
		'top' : 0.5*Math.max($(window).height() - tableSize.height, 200)+'px' 
	});
	
	$('.info').css({
		'white-space' : 'nowrap',
		'position' : 'absolute',
		'display' : 'inline',
		'float' : 'none',
		'text-align' : 'center',
		'top' : (parseInt($('#gametable > table').css('top'))-50)+'px',
		'width' : '',//(tableSize.width + 40)+'px',
		'left' : (parseInt($('#gametable > table').css('left')) - 20)+'px'
	});
	$('#info').parent().css({
		'width' : $(window).width()+'px'
	});
	
	var fadeWidth = 150;
	for (var xPos = 0; xPos < $('#info').parent().width(); xPos += 4) { 
		var op = Math.max(0, (xPos - parseInt($('#gametable > table').css('left')) < 0) ? 1	
			: 1 - (xPos - parseInt($('#gametable > table').css('left'))) / fadeWidth);
		if(op == 0) continue;
		$('<div></div>').css({ 
			opacity: op, 
			left: xPos,
			top: 0,
			height: parseInt($('#gametable > table').css('top')),
			width: 4
		}).addClass('fade-slice').appendTo($('#info').parent()); 
	} 

	for (var xPos = $('#info').parent().width()-4; xPos > 0; xPos -= 4) { 
		var op = Math.max(0, (parseInt($('#gametable > table').css('left')) + $('#gametable > table').width() - xPos < 0) ? 1	
			: 1 - (parseInt($('#gametable > table').css('left')) + $('#gametable > table').width() - xPos) / fadeWidth);
		if(op == 0) continue;
		$('<div></div>').css({ 
			opacity: op, 
			left: xPos,
			top: 0,
			height: parseInt($('#gametable > table').css('top')),
			width: 4
		}).addClass('fade-slice').appendTo($('#info').parent()); 
	} 
	$('td').droppable({ 
		accept: '.cross, .circle', 
		hoverClass: 'drophover',
		tolerance: 'pointer',
/*		drop: function(event, ui) {
		}*/
	});
});

$(document).ready(function() {
	var coords = [];
	for(var i=0;i<5;++i) {
		var flag = 0;
		while(!flag) {
			var x = Math.floor(Math.random() * (parseInt($('#gametable > table').css('left')) - $('td').outerWidth()));
			if(Math.random() > 0.5)
				x = $(window).width() - $('td').outerWidth() - x;
			var y = Math.random() * ($(document).height() - $('td').outerHeight() - parseInt($('#gametable > table').css('top'))) 
					+ parseInt($('#gametable > table').css('top'));
			flag = 1;
			for(var j=0;j<coords.length;++j) {
				flag = flag && (Math.abs(x-coords[j].x)>$('td').outerWidth() || Math.abs(y-coords[j].y)>$('td').outerHeight()); 
			} 
		}
		$elem =  $('<div></div>');
		$elem.css({
			left: x, 
			top: y,
			width: $('td').first().outerWidth(),
			height: $('td').first().outerHeight(),
			'background-color': 'transparent',
			position: 'absolute',
			display: 'none'
		}).appendTo($('body'));
		$elem.draggable();
		coords.push({x:x,y:y});
	}
});

$(document).ready(function () {
	var style_check = {'X' : 'cross', 'O' : 'circle'};
	var gameEnded = false;
	var curPlayerChecker = '';
	var gameStatus = 'no_status';
	var hasRepainted = false;
	
	$('td').bind( "drop", function(event, ui) {
		if(gameStatus != 'moving') return;
		ui.helper.animate({
			left: $(this).offset().left,
			top: $(this).offset().top
		}, 300);
		$(this).trigger('click', event);
		ui.helper.draggable("option", "disabled", true);
	});
	
	var isYourTurn = function() {
		return (gameStatus == 'moving');
	};

	var setMode = function() {
    	$.post('gamestatus', {mode: 'ask'}, function(data) {
			gameStatus = $.switchStatus(gameStatus, data);
		}); 
	};
//	setInterval(setMode, 2000);
//	setMode();
   	$.post('gameprocess2', {mode: 'ask'}, function(data) {
		if(!data) return;
		gameStatus = $.switchStatus(gameStatus, data);
		if (gameStatus == 'moving') curPlayerChecker = 'X'; 
		else if (gameStatus == 'waiting') curPlayerChecker = 'O';
		var $draggable = $('div:not(#error):hidden'); 
		$draggable.addClass(style_check[curPlayerChecker]).fadeIn('slow');
	});	
	

	var infoLoop = function() {
//		if (parseInt($('#info').css('left')) < 0)
			$('#info').css({
				left: parseInt($('#gametable > table').css('left')) + $('#gametable > table').innerWidth()
			});
		var tt = $('#info').outerWidth();
		$('#info').animate({
			left: 0//parseInt($('#gametable > table').css('left'))-$('#info').textWidth()
		}, {
			easing : 'linear',
			queue: false,
			duration: 10000,
			complete: infoLoop,
/*			step : function(now, fx) {
				$('#info').css({
					width: Math.min($(window).width(), parseInt($('#info').css('left'))+$('info').textWidth())
				});
			}*/
			
		});
	};
	
	jQuery.fx.interval = 10;
	infoLoop();
	
    setInterval(function() {
      $.post('gameprocess2', {mode: gameStatus, online: '1'});
	}, 5000);
	
	setInterval(function() {
		if(gameStatus != 'waiting') return;
		$.post('gameprocess2', {mode: gameStatus}, function(data) {
			var status_data = data;
			if(data == 'waiting' || hasRepainted) return;
			//gameStatus = $.switchStatus(gameStatus, data);
		   	$.post('gameprocess2', {mode: gameStatus}, function(data) {
				if(data) {
					gameStatus = $.switchStatus(gameStatus, status_data);
					hasRepainted = true;
					a = data.split(' ');
					var a = data.split(' ');
					var $this;
					$this = $('#gametable > table > tbody > tr:eq('+(parseInt(a[2]))+') > td:eq('+(parseInt(a[1]))+')');
					$this.addClass(style_check[a[0]]);
				}
			}); 
		});
	}, 3000);
	
	$('td').hover(function () {
		$(this).css({'background-color': 'white'})}, 
		function() {$(this).css({'background-color': 'yellow'})})
	.click(function(data, event) {
		var $td = $(this);
		if(gameEnded) {
			$(this).unbind('click');
			return false;
		}
		
		// 'Quick-check' hack
		if(gameStatus == 'move' && curPlayerChecker != '') {
			gameStatus = $.switchStatus(gameStatus, 'not_move');
			$td.addClass(style_check[curPlayerChecker]);
		};
		// /'Quick-check' hack
		
		var xCoord = Math.floor((event['clientX'] - parseInt($('#gametable > table').css('left'))) / $td.outerWidth());
		var yCoord = Math.floor((event['clientY'] - parseInt($('#gametable > table').css('top'))) / $td.outerHeight()); 
//		$('#info').text('data[clientX]='+data['clientX']+' gametable='+parseInt($('#gametable > table').css('left')));
		$.post('gameprocess2', {mode: gameStatus, x : ''+xCoord, y : ''+yCoord}, function(data) {
			var cannotExp = /cannot/;
			if(cannotExp.test(data)){
				return;
			}
			else {
				gameStatus = $.switchStatus(gameStatus, 'waiting'); // it's a hack!
				var xExp = /X/;
				(xExp.test(data)) ? $td.addClass(style_check['X']) : $td.addClass(style_check['O']);
				var notendedExp = /not_ended/;
				if(notendedExp.test(data)){}
				else {
					gameEnded = true;
					$.setWinCells(data);
				}
				setMode();
				hasRepainted = false;
			}
		});
		
	});
		
});
