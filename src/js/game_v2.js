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

jQuery.switchStatus = function(oldStatus, message) {
	if(message instanceof Array) message = message.join();
	var newStatus = message.split(' ')[0];
	if(oldStatus == newStatus) return oldStatus;
	var $info = $('#info');
	$info.fadeOut('fast', function() {
		switch (newStatus) {
			case 'lose':
				$info.text('You lose');
				$.setWinCells(message.slice(message.search(/ /)+1));
				break;
			case 'moving':
				$info.text('Your turn');
				break;
			case 'win':
				$info.text('You win');
				$.setWinCells(message.slice(message.search(/ /)+1));
				break;
			case 'waiting':
				$info.text("Waiting for " + $.opponentName);
				break;
			case 'opponent_offline':
				$info.text("Opponent is offline");
				break;
		}
		$info.css('left', parseInt($('#gametable > table').css('left')) + $('#gametable > table').innerWidth()).fadeIn('fast');
	});
//	alert('status is '+newStatus);
	return newStatus;
}

jQuery.setWinCells = function(data) {
	var win_style; // Very dirty
	if($.gameStatus == 'win') {
		win_style = $.style_check[$.curPlayerChecker];
	} else {
		($.curPlayerChecker == 'X') ? win_style = $.style_check['O'] : win_style = $.style_check['X'];
	}
	
	data = data.split(' ');
	while (data.length > 0 && isNaN(parseInt(data[0]))) 
	data.splice(0, 1);
	var $this;
	for (var i = 0; i < data.length / 2; ++i) {
		$this = $('#gametable > table > tbody > tr:eq(' + (parseInt(data[2 * i + 1])) + ') > td:eq(' + (parseInt(data[2 * i])) + ')');
		$this.addClass(win_style).animate({'background-color': '#c8ff32'}, 1500);
		$this.unbind('hover');
	}
}

$(document).ready(function() {
	// Dirty sexy globals
	$.style_check = {'X' : 'cross', 'O' : 'circle'};
	$.gameEnded = false;
	$.curPlayerChecker = $.cookie('sign');
	$.gameStatus = '';
	$.opponentName =  $.cookie('opponent name');
	
	/* Status checker */
	var statusCheck = /*setInterval(*/ function(){
		if ($.gameStatus != 'waiting') 
			return;
		$.post('gameprocess2', {
			mode: 'ask'
		}, function(data){
			if (data) {
				var coords = data.slice(data.search(/ /)+1).split(',');
				for (var i=0; i<coords.length; ++i) {
					var item = coords[i];
					item = item.split(' ');
					if ($.curPlayerChecker != item[0]) {
						$('#gametable > table > tbody > tr:eq(' + (parseInt(item[2])) + ') > td:eq(' + (parseInt(item[1])) + ')')
							.addClass($.style_check[item[0]]);
					}
				}
				$.gameStatus = $.switchStatus($.gameStatus, data);
				if($.gameStatus == 'waiting') {
					setTimeout(statusCheck, 3000);
				}
			}
		});
	}
	/*}, 20000); */
	/* /Status checker */
	
	/* Get initial status */
   	$.post('gameprocess2', {mode: 'ask'}, function(data) {
		$.gameStatus = $.switchStatus($.gameStatus, data);
		if(!data) return;
		if ($.gameStatus == 'waiting') {
			//$.curPlayerChecker = 'O';
			statusCheck();
		}
		var $draggable = $('div:not(#error):hidden'); 
//		while($.curPlayerChecker == '') {}
		$draggable.addClass($.style_check[$.curPlayerChecker]).fadeIn('slow');
	});	
	/* /Get initial status */
	
	$('td').hover(function () {
		if(!$.gameEnded)
			$(this).css('background-color', 'white')
	}, function() {
		if(!$.gameEnded)
			$(this).css('background-color', 'yellow');
	});
	
	/* Drop event */
	$('td').bind( "drop", function(event, ui) {
		var $td = $(this);
		
		if($.gameStatus != 'moving' || $td.hasClass('cross') || $td.hasClass('circle') || $td.droppable( "option", "disabled" )) return false;
		$td.droppable("option", "disabled", true); // Cell is used from now
		$td.unbind('drop');
		ui.helper.animate({
			left: $(this).offset().left,
			top: $(this).offset().top
		}, 300);
		
		if($.gameEnded) {
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
//				$td.removeClass('droppable');
//				$td.droppable("option", "disabled", true); // Cell is used from now
				ui.helper.draggable("option", "disabled", true); // Check is used from now - line with the same logic is located upper <- FIX
				ui.helper.css('z-index', 1);
				$.gameStatus = $.switchStatus($.gameStatus, data);
				if (data.search(/(moving)|(waiting)/) != -1) {
					statusCheck();
				}
				else { // Game is ended (TODO: 'opponent offline' case)
					$.gameEnded = true;
//					$.gameStatus = $.switchStatus($.gameStatus, data); 
				}
			}
		});
	});
	/* /Drop event */
});
