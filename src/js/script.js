function sendMessage(message) {
  var client = new XMLHttpRequest();
  client.open("POST", "/log");
  client.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
  client.send(message);
}

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
});

$(document).ready(function () {
//	$('#gametable').css({'background-color': 'yellow', 'top': '100px'});
	var curPlayer = 0;
	var gameStart = true;
	var size = 3;//$('tr').size();
	var winSeq = new RegExp('X{'+size+'}|O{'+size+'}');
	$('td').hover(function () {
		$(this).css({'background-color': 'white'})}, 
		function() {$(this).css({'background-color': 'yellow'})})
	.click({player: curPlayer}, function(event) {
		if(!gameStart) {
			$(this).unbind('click');
			return false;
			}
		var symb = $(this).text();
		if(symb != 'X' && symb != 'O')
		{
			(curPlayer == 0) ? $(this).text('O') : $(this).text('X');
			curPlayer = 1 - curPlayer;
		}
		var	rowText = '';
		$(this).parent().children().each(function() {
			rowText += $(this).text();
			});
		var colText = '';
		var diag1Text = '';
		var diag2Text = '';
		var col = Math.ceil(event.pageX / $(this).outerWidth(true)) - 1;
		var $rows = $(this).parent().siblings().andSelf();
		$rows.each(function(index) {
			colText += $(this).children().eq(col).text();
			diag1Text += $(this).children().eq(index).text();
			diag2Text += $(this).children().eq($rows.size()-1-index).text();
			});
			
		gameStart = false;
		if(winSeq.test(rowText)) {
			$(this).parent().children().css({'color': 'red'});
		}
		else if(winSeq.test(colText)) {
			$rows.each(function() {
				$(this).children('td').eq(col).css({'color': 'red'});});
		}
		else if(winSeq.test(diag1Text)) {
			$rows.each(function(index) {
				$(this).children('td').eq(index).css({'color': 'red'});});
		}
		else if(winSeq.test(diag2Text)) {
			$rows.each(function(index) {
				$(this).children('td').eq($rows.size()-1-index).css({'color': 'red'});});
		}
		else gameStart = true;
		
    // send-server code
    var isEnded;
    
    // /send-server code
		
		});
});
