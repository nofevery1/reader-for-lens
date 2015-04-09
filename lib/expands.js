var resCount = 0;
var citArray = []; //Array to store the reference resource Ids
var figArray = [];

var expands = {
  listener: function() {
    var that = this;
    $("span.highlightable").click( function() {
      var spanId = $(this).attr('id');
      console.log(spanId);
      var resources = $('#'+spanId +' > a.resource-reference');
      if (resources.length > 0) {
        //if resources exist, create arrays containing the article citation Ids of the target
        for (resCount=0 ; resCount < resources.length ; resCount++) {
          var toPush = resources[resCount].dataset.id.split("_divider_")[1];
          if (toPush.match("article_citation")) {
            citArray.push(toPush);
          }
          if (toPush.match("figure")) {
            figArray.push(toPush);
          }
        }
        expands.createExpand(spanId);
      }
      else {
        console.log("no refs");
      }
    });
  },
  //function to create the expand div, but keep hidden until populated (display none in css)
  createExpand: function (spanId) {
    var newDiv = $("<div>", {
      id: spanId + "parent",
      class: "expandParent"
    });
    newDiv.insertAfter("#"+spanId);
    var expandId = spanId + "parent";
    //exceptions to test what to create depending on presence of citations and figures
    if (citArray.length > 0) {
      var citDiv = $("<div>", {
        id: spanId+"citations";
        class: "citDiv";
      });
      var citId = spanId+"citations";
      citDiv.appendTo(expandId);
      populator.citations(citId,citArray);
    }
    if (figArray.length > 0) {
      var figDiv = $("<div>", {
        id: spanId+"figures";
        class: "figDiv";
      });
      var figId = spanId+"figures";
      figDiv.appendTo(expandId);
      populator.figures(figId,figArray);
    }
  }
}

//methods for populating the expands
var populator = {
  citations: function(expandId,citArray) {

  },
  figures: function(figId,figArray) {

  }
}
