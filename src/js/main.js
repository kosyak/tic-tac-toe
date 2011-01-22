function checkGameStart() {
  $.get('gamestart', {}, function() {});
};

$(document).ready(function() {
  $paddingX = $(document).width()*0.99;
  $paddingY = $(document).height()*0.99;
  $('#login form > input').each(function() {
    $paddingX -= $(this).outerWidth();
    $paddingY -= $(this).innerHeight();
  });
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
  
  setInterval(checkGameStart, 1000);
                   
  $('#login form > input[type="submit"]').click(function() {
    setInterval(function() {
      $.post('onlinechecker', {online: '1'}, function(data) {});
    }, 5000);
  
    $(this).parent().fadeOut('slow', function() {
      $('#throbber').fadeIn('fast');
      $('#login > p').fadeIn('fast');
    });
    return false; 
  })
});
