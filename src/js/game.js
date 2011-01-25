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
			case 'move':
				$info.text('Your turn');
				break;
			case 'win':
				$info.text('You win');
				$.setWinCells(newStatus);
				break;
			case 'not_move':
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
			$('<td> </td>').appendTo($tr);
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
	
});

$(document).ready(function () {
	var gameEnded = false;
	var curPlayerChecker = '';
	var gameStatus = 'no_status';
	var hasRepainted = false;
	
	var isYourTurn = function() {
		return (gameStatus == 'move');
	};

	var setMode = function() {
    	$.post('gamestatus', function(data) {
			gameStatus = $.switchStatus(gameStatus, data);
		}); 
	};
//	setInterval(setMode, 2000);
//	setMode();
   	$.post('gamestatus', function(data) {
		gameStatus = $.switchStatus(gameStatus, data);
		if (gameStatus == 'move') curPlayerChecker = 'X'; 
		else if (gameStatus == 'not_move') curPlayerChecker = 'O';
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
      $.post('onlinechecker', {online: '1'});
	}, 5000);
	
	setInterval(function() {
		if(gameStatus != 'not_move') return;
		$.post('gamestatus', {}, function(data) {
			var status_data = data;
			if(data == 'not_move' || hasRepainted) return;
			//gameStatus = $.switchStatus(gameStatus, data);
		   	$.post('gamerepaint', function(data) {
				if(data) {
					gameStatus = $.switchStatus(gameStatus, status_data);
					hasRepainted = true;
					a = data.split(' ');
					var a = data.split(' ');
					var $this;
					$this = $('#gametable > table > tbody > tr:eq('+(parseInt(a[2]))+') > td:eq('+(parseInt(a[1]))+')');
					$this.text(a[0]);
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
			$td.text(curPlayerChecker);
		};
		// /'Quick-check' hack
		
		var xCoord = Math.floor((data['clientX'] - parseInt($('#gametable > table').css('left'))) / $td.outerWidth());
		var yCoord = Math.floor((data['clientY'] - parseInt($('#gametable > table').css('top'))) / $td.outerHeight()); 
//		$('#info').text('data[clientX]='+data['clientX']+' gametable='+parseInt($('#gametable > table').css('left')));
		$.post('gameprocess', {x : ''+xCoord, y : ''+yCoord}, function(data) {
			var cannotExp = /cannot/;
			if(cannotExp.test(data)){
				return;
			}
			else {
				gameStatus = $.switchStatus(gameStatus, 'not_move');
				var xExp = /X/;
				(xExp.test(data)) ? $td.text('X') : $td.text('O');
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
