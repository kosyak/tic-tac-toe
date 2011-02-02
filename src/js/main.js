Array.prototype.xyInArray = function(elem) {
	for (var i = 0; i < this.length; ++i) {
		if (this[i].x == elem.x && this[i].y == elem.y) 
			return true;
	}
	return false;
}

$(document).ready(function() {
	var coords = [];
	var cellSize = 150;
	for (var i = 0; i < 5; ++i) {
		var xy = {};
		while (xy.x === undefined) {
			xy.x = Math.floor(Math.random() * ($(window).width() - cellSize) / cellSize);
			xy.y = Math.floor(Math.random() * ($(window).height() - cellSize) / cellSize);
			if (coords.xyInArray(xy)) 
				xy = {};
			else {
				coords.push(xy);
				var imgURL = ((1 - Math.random()) * Math.random() > 0.5) ? 'url(../img/cross.png)' : 'url(../img/circle.png)';
				$('<div></div>').addClass('background').css({
					left: cellSize * xy.x,
					top: cellSize * xy.y,
					width: cellSize,
					height: cellSize,
					'z-index': -1,
					'background-image': imgURL
				}).appendTo($('body'));
			}
		}
	}
	
  var $paddingX = $(window).width();
  var $paddingY = $(window).height();
  var formWidth = 0;
  $('#login form > input').each(function() {
    formWidth += $(this).outerWidth();
    $paddingY -= $(this).innerHeight();
  });
  $('#login form').css({'width' : (20+formWidth)+'px'});
  $paddingX -= $('#login form').outerWidth();
  $paddingY -= $('#login form').outerHeight();
  $paddingX /= 2; 
  $paddingY /= 2;
  $('#login').css({'padding':   $paddingY + 'px ' + 
                   /*'padding-left':*/  $paddingX + 'px'
                   /*'padding-bottom':($(document).height()-$paddingY) + 'px',
                   'padding-right': ($(document).width()-$paddingX) + 'px',*/
                   });
  $('#throbber').css({'padding-left': ($('#login').width()*0.5-32)+'px'});
  
/*  setInterval(function() {
    $('#offline').fadeIn('slow', function() {
      $(this).delay(5000).fadeOut('slow');
  })}, 7000);*/
  
  $('#login form > input[type="submit"]').click(function() {
  	if ($('#name').val() == '') return false;
    setInterval(function() {
      $.post('onlinechecker', {online: '1'}, function(data) {});
    }, 5000);
	
    $(this).parent().fadeOut('slow', function() {
      $('#throbber').fadeIn('fast');
      $('#login > p').fadeIn('fast');
    });
	
	setInterval(function () {
  		$.get('gamestart', {}, function(data) {
			if(data == 'OK') {
				window.location.href = '/game';
			}
		});
  	}, 2000);
	
	setInterval(function () {
  		$.get('test', {}, function(data) {
			/*$('#info').text(data).fadeIn('fast', function() {
				$(this).delay(1500).fadeOut('fast');
			});*/
		});
  	}, 2000);
	
	$.post('game', {name : $('#name').val()}, function(data) {
		/*$('#info').text(data).fadeIn('fast'); */
	});
    return false; 
  });
});


