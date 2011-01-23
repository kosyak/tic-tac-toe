function setStatus(old_status, new_status) {
	if(old_status == new_status) return;
	$info = $('#info');
	$info.fadeOut('fast');
	switch (new_status) {
		case 'lose':
			$info.text('You lose');
		break;
		case 'move':
			$info.text('Your turn');
		break;
		case 'win':
			$info.text('You won');
		break;
		case 'not_move':
			$info.text("Opponent's turn");
		break;
		case 'opponent_offline':
			$info.text("Opponent is offline");
		break;
 	}
	$info.fadeIn('fast');
	old_status = new_status;
	return old_status;
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
});

$(document).ready(function () {
	var gameEnded = false;
	var curPlayer = $.cookie("playerNumber");
	var status = '';
	
	$.post('gamestatus', {}, function(data) {
		status = setStatus(status, data);
	    setInterval(function() {
    		$.post('gamestatus', {}, function(data) {
			status = setStatus(status, data);
		});
	}, 1000)
	});
	
    setInterval(function() {
      $.post('onlinechecker', {online: '1'}, function(data) {
	  	if(data['otherPlayerOfflie']) {
		    $('#offline').text('Other player is offline!').fadeIn('slow');
		}});
	}, 5000);
	
	setInterval(function() {
		$.post('gamerepaint', {}, function(data) {
			if(data) {
				a = data.split(' ');
				$this = $('#gametable > table > tbody > tr:eq('+(parseInt(a[2]))+') > td:eq('+(parseInt(a[1]))+')');
				$this.text(a[0]);
			}
		});
	}, 3000);				
	$('td').hover(function () {
		$(this).css({'background-color': 'white'})}, 
		function() {$(this).css({'background-color': 'yellow'})})
	.click({player: curPlayer}, function(data, event) {
		$td = $(this);
		if(gameEnded) {
			$(this).unbind('click');
			return false;
			}
//		var delta = 
		var xCoord = Math.floor((data['clientX']/* - $(this).parent().css(''))*/) / $(this).innerWidth());
		var yCoord = Math.floor(data['clientY'] / $(this).innerHeight()); 
		$('#error').fadeIn('fast').text('x='+xCoord+' y='+yCoord);
		$.post('gameprocess', {x : ''+xCoord, y : ''+yCoord}, function(data) {
			var cannotExp = /cannot/;
			if(cannotExp.test(data)){
				return;
			}
			else {
				var xExp = /X/;
				(xExp.test(data)) ? $td.text('X') : $td.text('O');
				var notendedExp = /not_ended/;
				if(notendedExp.test(data)){
					
				}
				else {
					gameEnded = true;
					$('body').append('<p id="info"></p>');
					$('#info').text('Game is Enede').fadeIn('slow');
				}
			}
		});
		
	});
		
});
