$(document).ready(function() {
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
  
  setInterval(function() {
    $('#offline').fadeIn('slow', function() {
      $(this).delay(5000).fadeOut('slow');
  })}, 7000);
  
  $('#login form > input[type="submit"]').click(function() {
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
			$('#info').text(data).fadeIn('fast', function() {
				$(this).delay(500).fadeOut('fast');
			});
		});
  	}, 2000);
*/	
	$.post('game', {name : $('#name').val()}, function(data) {
		$('#info').text(data).fadeIn('fast');
	});
    return false; 
  });
});
