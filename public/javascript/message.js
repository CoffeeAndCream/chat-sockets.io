$(function(){
  $(document).on('click','.delete-message', function(){
    $(this).parent().fadeOut().remove();
  });
});
