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
});

$(document).ready(function () {
	var gameEnded = false;
	var curPlayer = $.cookie("playerNumber");
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
	setMode();
	
    setInterval(function() {
      $.post('onlinechecker', {online: '1'});
	}, 5000);
	
	setInterval(function() {
		if(gameStatus != 'not_move') return;
		$.post('gamestatus', {}, function(data) {
			var status_data = data;
			if(data == 'not_move' || hasRepainted) return;
//			gameStatus = $.switchStatus(gameStatus, data);
		   	$.post('gamerepaint', function(data) {
				if(data) {
					hasRepainted = true;
					a = data.split(' ');
					var a = data.split(' ');
					var $this;
					$this = $('#gametable > table > tbody > tr:eq('+(parseInt(a[2]))+') > td:eq('+(parseInt(a[1]))+')');
					$this.text(a[0]);
					gameStatus = $.switchStatus(gameStatus, status_data);
				}
			}); 
		});
	}, 2000);
	
	$('td').hover(function () {
		$(this).css({'background-color': 'white'})}, 
		function() {$(this).css({'background-color': 'yellow'})})
	.click({player: curPlayer}, function(data, event) {
		$td = $(this);
		var $td = $(this);
		if(gameEnded) {
			$(this).unbind('click');
			return false;
		}
		var xCoord = Math.floor((data['layerX']) / $(this).outerWidth());
		var yCoord = Math.floor((data['layerY']) / $(this).outerHeight()); 
		$.post('gameprocess', {x : ''+xCoord, y : ''+yCoord}, function(data) {
			var cannotExp = /cannot/;
			if(cannotExp.test(data)){
				return;
			}
			else {
				gameStatus = $.switchStatus (gameStatus, 'not_move');
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
