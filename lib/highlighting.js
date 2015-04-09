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
      $(this).toggleClass("highlightable");
    });
  }
  
}
