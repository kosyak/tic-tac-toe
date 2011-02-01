$.fn.textWidth = function(){ // Not needed
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
}

$(document).ready(function() {
	var style_check = {'X' : 'cross', 'O' : 'circle'};
	var gameEnded = false;
	var curPlayerChecker = '';
	var gameStatus = 'no_status';
	var hasRepainted = false;
	
	/* Status checker */
	var statusCheck = /*setInterval(*/ function(){
		if (gameStatus != 'waiting') 
			return;
		$.post('gameprocess2', {
			mode: 'ask'
		}, function(data){
			if (data) {
				gameStatus = $.switchStatus(gameStatus, data);
				hasRepainted = true;
				a = data.split(' ');
				var a = data.split(' ');
				var $this;
				$this = $('#gametable > table > tbody > tr:eq(' + (parseInt(a[2])) + ') > td:eq(' + (parseInt(a[1])) + ')');
				$this.addClass(style_check[a[0]]);
				if(gameStatus == 'waiting') {
					setTimeout(statusCheck, 3000);
				}
			}
		});
	}
	/*}, 20000); */
	/* /Status checker */
	
	/* Get initial status */
   	$.post('gameprocess2', {mode: 'ask'}, function(data) {
		if(!data) return;
		gameStatus = $.switchStatus(gameStatus, data);
		if (gameStatus == 'moving') 
			curPlayerChecker = 'X';
		else 
			if (gameStatus == 'waiting') {
				curPlayerChecker = 'O';
				statusCheck();
			}
		var $draggable = $('div:not(#error):hidden'); 
		$draggable.addClass(style_check[curPlayerChecker]).fadeIn('slow');
	});	
	/* /Get initial status */
	
	$('td').hover(function () {
		$(this).css('background-color', 'white')
	}, function() {
		$(this).css('background-color', 'yellow');
	});
	
	/* Drop event */
	$('td').bind( "drop", function(event, ui) {
		
		if(gameStatus != 'moving') return false;
		
		ui.helper.animate({
			left: $(this).offset().left,
			top: $(this).offset().top
		}, 300);
		
		var $td = $(this);
		if(gameEnded) {
			$(this).unbind('drop');
			return false;
		}
		
		var xCoord = Math.floor((event['clientX'] - parseInt($('#gametable > table').css('left'))) / $td.outerWidth());
		var yCoord = Math.floor((event['clientY'] - parseInt($('#gametable > table').css('top'))) / $td.outerHeight()); 
//		$('#info').text('data[clientX]='+data['clientX']+' gametable='+parseInt($('#gametable > table').css('left')));
		$.post('gameprocess2', {mode: 'moving', x : ''+xCoord, y : ''+yCoord}, function(data) {
			if(data.search(/cannot/i) != -1){ // Player cannot move
				alert('Exception: player cannot move'); // Abnormal behavior
				return false;
			}
			else {
				ui.helper.draggable("option", "disabled", true); // Check is used from now
				gameStatus = $.switchStatus(gameStatus, 'waiting'); // Definitely 'waiting' now
				//data.search(/X/) != -1) ? $td.addClass(style_check['X']) : $td.addClass(style_check['O']);
				if (data.search(/(moving)|(waiting)/) != -1) {
					statusCheck();
				}
				else { // Game is ended (TODO: 'opponent offline' case)
					gameEnded = true;
					data = data.split(' '); // setWinCells() function
					while (data.length > 0 && isNaN(parseInt(data[0]))) 
						data.splice(0, 1);
					var $this;
					for (var i = 0; i < data.length / 2; ++i) {
						$this = $('#gametable > table > tbody > tr:eq(' + (parseInt(data[2 * i + 1])) + ') > td:eq(' + (parseInt(data[2 * i])) + ')');
						$this.css('background-color', 'blue');
					}
				}
				
/*		    	$.post('gameprocess2', {mode: 'waiting'}, function(data) {  //  setMode() function
					gameStatus = $.switchStatus(gameStatus, data); 
				}); */
				
				hasRepainted = false;
			}
		});
	});
	/* /Drop event */
});
