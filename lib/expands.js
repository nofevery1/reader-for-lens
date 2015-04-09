var expands = {
  listener: function() {
    $("span.highlightable").click( function() {
      var spanId = $(this).attr('id');
      console.log(spanId);
      var resources = $('#'+spanId +' > a.resource-reference');
      if (resources.length > 0) {
        resources.each(function(i,obj) {
          console.log(i+" "+obj.attr('[data-id]'));
        });
      }
      else {
        console.log("no refs");
      }
    });
  },
  createExpand: function () {}
}
