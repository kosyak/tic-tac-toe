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
	
    setInterval(function() {
      $.post('onlinechecker', {online: '1'}, function(data) {
	  	if(data['otherPlayerOfflie']) {
		    $('#offline').text('Other player is offline!').fadeIn('slow');
		}});
	});
				
	$('td').hover(function () {
		$(this).css({'background-color': 'white'})}, 
		function() {$(this).css({'background-color': 'yellow'})})
	.click({player: curPlayer}, function(data, event) {
		if(gameEnded) {
			$(this).unbind('click');
			return false;
			}
		$.post('gameprocess', {checked : "1"}, function(data) {
			if(data['canCheck'] == '1')
			{
				var symb = $(this).text();
				if(symb != 'X' && symb != 'O')
				{
					(curPlayer == 0) ? $(this).text('O') : $(this).text('X');
					curPlayer = 1 - curPlayer;
				}
		
				var xCoord = Math.floor(data['clientX'] / $(this).innerWidth());
				var yCoord = Math.floor(data['clientY'] / $(this).innerHeight()); 
				$.post('gameprocess', {x : ''+xCoord, y : ''+yCoord}, function(data) {
					if(data['gameEnded']) gameEnded = true;
				});
			}
		});
		
	});
});
