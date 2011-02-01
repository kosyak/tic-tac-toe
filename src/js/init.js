$(document).ready(function() {
/* Initialize game table */
	var size = 5; // dirty
	var $tbody = $('tbody');
	for (var i = 0; i < size; ++i) {
		var $tr = $('<tr></tr>');
		for (var j = 0; j < size; ++j) {
			$('<td></td>').appendTo($tr);
		}
		$tr.appendTo($tbody);
	}
	var tableSize = {
		width: size * $('td').outerWidth(),
		height: size * $('td').outerHeight()
	}; 
	
	$('#gametable > table').css({
		left: 0.5*Math.max($(window).width() - tableSize.width, 0), 
		top: 0.5*Math.max($(window).height() - tableSize.height, 200)
	});
/* /Initialize game table */
	
/* Initialize information string animation */
	$('.info').css({
		'white-space': 'nowrap',
		'position': 'absolute',
		'display': 'inline',
		'float': 'none',
		'text-align': 'center',
		top: (parseInt($('#gametable > table').css('top'))-50),
//		width: '',
		left: (parseInt($('#gametable > table').css('left')) - 20)
	});
	$('#info').parent().css('width', $(window).width());
	
	var fadeWidth = 150; // WTF??
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
	
	var infoLoop = function() {
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
		});
	};
	jQuery.fx.interval = 10;
	infoLoop();
/* /Initialize information string animation */

/* Make table cells droppable */
	$('td').droppable({ 
		accept: '.cross, .circle', 
		hoverClass: 'drophover',
		tolerance: 'pointer',
	});
/* /Make table cells droppable */

/* Put draggable checks */
	var coords = [];
	for(var i=0;i<13;++i) {
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
/* /Put draggable checks */
});
