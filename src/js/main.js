$(document).ready(function() {
  var $paddingX = $(window).width();
  var $paddingY = $(window).height();
  var formWidth = 0;
  $('#login form > input').each(function() {
    formWidth += $(this).outerWidth();
    $paddingY -= $(this).innerHeight();
  });
  $('#login form').css({'width' : (10+formWidth)+'px'});
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
	
	setInterval(function checkGameStart() {
  		$.get('gamestart', {}, function() {});
  	}, 1000);
	
	$.post('game', {name : $('name').val()});
    return false; 
  })
});
