$(document).ready(function() {
  $paddingX = $(document).width();
  $paddingY = $(document).height();
  $('#login form > input').each(function() {
    $paddingX -= $(this).outerWidth();
    $paddingY -= $(this).outerHeight();
  });
  $paddingX /= 2; 
  $paddingY /= 2;
  $('#login').css({'padding-left': $paddingX + 'px',
                   'padding-top':  $paddingY + 'px'});
});
