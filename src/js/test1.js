$(document).ready(function() {
  $('button').hover(function () {
    $(this).text('Send'); 
    }, function () {
      $(this).text('Button'); 
    });
    
  $.ajaxSetup({
    url: 'test',
    type: 'POST',
    dataType: 'text'
  });
  
  $('button').click(function () {
    $.post('test', {data: $('input').val()}, function(data) {
      $('#result').append('<p>'+data+'</p>');
    });
  });
});
