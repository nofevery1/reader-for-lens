$(document).ready( function () {

  highlighter.highlightInit();

  //Prevent any action when reference resources are clicked
  linkKill();
  expands.listener();
});

var linkKill = function() {
  $('a.resource-reference').click( function(e) {
    e.preventDefault();
    e.preventPropagation();
  });
}

var highlighter = {
  highlightInit: function() {
    console.log('ready');
    var hiObj = { 'pop': 'val'};
    var counter = 0;
    var hiArr = $('.content-node.paragraph > .content > .content-node.text > .content').map(function() {
      return $(this).text()+"_divider_"+$(this).parent().attr('data-id');
    }).get();
    //console.log(hiArr);
    hiArr.forEach(function(arr) {
      var tempArr = arr.split("_divider_");
      hiObj[tempArr[1]] = tempArr[0];
    });
    //        console.log(hiObj);
    $.each(hiObj, function(key,value) {
      //console.log(key + " " + value);
      var $keeper = $("<div>"),
      $p = $("[data-id=\""+key+"\"] > .content"),
      $line = $("<span>", {
        id: "inline_"+key+"_"+counter,
        class: "highlightable"
      });
      if ($p.html() != undefined) {
        $p.html().split(". ").forEach(function (elem) {
          //console.log(elem);
          if (elem.match(/[a-zA-Z]+/)) {
            if (elem === $p.html().split(". ")[$p.html().split(". ").length-1]) {
              $line.html($line.html() + elem);
            }
            else {
              $line.html($line.html() + elem + ". ");
            }
            $line.appendTo($keeper);
            //counterObj["inline"+count]=0; //object to store click counts of each element
            //count++;
            counter++;
            $line = $("<span>", {
              id: "inline_"+key+"_"+counter,
              class: "highlightable"
            });
          }
        });
      }
      $p.html($keeper.html());

      $keeper.remove();
    });
    $( ".highlightable").on("click", function() {
            $(this).toggleClass("clicked");
    });
  }
}


var resCount = 0;
var citArray = []; //Array to store the reference resource Ids
var figArray = [];

var expands = {
  listener: function() {
    var that = this;
    $("span.highlightable").click( function() {
      //reset reference arrays
      citArray = [];
      figArray = [];
      var spanId = $(this).attr('id');
      if ($("#"+spanId+"parent").length > 0) {
        console.log("jumbo");
        $("#"+spanId+"parent").remove();
        return false;
      }
      console.log(spanId);
      var resources = $('#'+spanId +' > a.resource-reference');
      if (resources.length > 0) {
        //if resources exist, create arrays containing the article citation Ids of the target
        for (resCount=0 ; resCount < resources.length ; resCount++) {
          var toPush = resources[resCount].dataset.id.split("_divider_")[1];
          if (toPush.match("article_citation")) {
            citArray.push(toPush);
            console.log(toPush);
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
        id: spanId+"citations",
        class: "citDiv",
      });
      var citId = spanId+"citations";
      citDiv.appendTo("#"+expandId);
      populator.citations(citId,citArray);
    }
    if (figArray.length > 0) {
      var figDiv = $("<div>", {
        id: spanId+"figures",
        class: "figDiv"
      });
      var figId = spanId+"figures";
      figDiv.appendTo("#"+expandId);
      populator.figures(figId,figArray);
    }
    if(figArray.length > 0 || citArray.length > 0) {
    //This might break if populating things has to become asynchronous
      newDiv.show('slow');
    }
  }
}

//methods for populating the expands
var populator = {
  citations: function(citId,citArray) {
    //to do: check for multiple instances
    citArray.forEach( function(elem) {
      console.log($("[data-id='"+elem+"']"));
      $("[data-id='"+elem+"']:first").clone().show().appendTo("#"+citId);
    });
  },
  figures: function(figId,figArray) {
    figArray.forEach( function(elem) {
      console.log($("[data-id='"+elem+"']"));
      //adding array[0] specification to prevent cloned divs elsewhere in
      //the document from giving double hits.
      $("[data-id='"+elem+"']:first").clone().show().appendTo("#"+figId);
    });
  }
}
