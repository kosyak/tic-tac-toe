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
//		var delta = 
		var xCoord = Math.floor((data['clientX']/* - $(this).parent().css(''))*/) / $(this).innerWidth());
		var yCoord = Math.floor(data['clientY'] / $(this).innerHeight()); 
		$.post('gameprocess', {x : ''+xCoord, y : ''+yCoord}, function(data) {
			var cannotExp = /cannot/;
			if(caExp.test(data)){
				return;
			}
			else {
				var xExp = /X/;
				(xExp.test(data)) ? $(this).text('X') : $(this).text('O');
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
