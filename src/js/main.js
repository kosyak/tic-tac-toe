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
                   
  $('#login form > input[type="submit"]').click(function() {
    return true;
    $(this).parent().fadeOut('slow', function() {
      $('#throbber').fadeIn('fast');
      $('#login > p').fadeIn('fast');
    });
    return false;
  })
});
