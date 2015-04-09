$(document).ready( function () {

  highlighter.highlightInit();

  //Prevent any action when reference resources are clicked
  $('a.resource-reference').click( function(e) {
    e.preventDefault();
  });
  expands.listener();
});
