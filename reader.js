
//set global variables for height
var docHeight;
var winHeight;

$(document).ready( function () {
  highlighter.highlightInit();
  //Prevent any action when reference resources are clicked
  linkKill();
  expands.listener();
  twitterListener();
  scrolls.init();
  scrolls.listener();
  //scrolls.viewTracker();
  //watch for window resizing
  $(window).resize( function() {
    scrolls.init();
  });

  scrolls.viewTracker();
  authors.listener();
});

var authors = {
  listener: function () {
    $('a.contributor_reference').click( function(e) {
      e.preventDefault();
      console.log($(this));
      var dataId = $(this).context.dataset.id;

      console.log(dataId);
      if ($("#"+dataId).length > 0 ) {
        $("#"+dataId).slideToggle(1000, function() {
          console.log("kill");
          $(this).remove();
          return false;
        });
      }
      else {
        authors.keywords(dataId);
      }
    });
  },
  keywords: function (dataId) {

    var authorId = dataId;
    var authorName = $('[data-id="'+dataId+'"]').text().split(' ');
    var newDiv = $("<div>", {
      id: authorId,
      class: "authorParent"
    });
    newDiv.hide();
    newDiv.insertAfter('[data-id="'+dataId+'"]');
    //Right now I am removing the emphasis * on the MeSH Terms that denotes what the critical points of each article was. Should use star for weighting somehow.
    //Also include the OT term for author-defined keywords
    //Also include option to show author's papers that fell under designated term
    console.log(authorName);
    $.ajax({
      url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term="+authorName[1]+"%20"+authorName[0]+"%5BAuthor%20-%20Full%5D",
      datatype: "json",
      success: function(data) {
        var arr = data.esearchresult.idlist;
        console.log(arr);
        var ids = arr.join(",");
        console.log(ids);
        $.ajax({
          url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id="+ids+"&rettype=medline",
          method: "GET",
          datatype: "text",
          complete: function(dataT) {
            //console.log(dataT);
            var obj = {
              "MeSH Term": "Frequency"
            }
            var out = dataT.responseText.split(/\n/);
            //console.log(out);
            out.forEach(function(elem) {
              if (elem.match("MH ")) {
                //console.log(elem);
                var entry = elem.replace(/MH +- /,"");
                var two = entry.replace(/\*/,"");
                //console.log(two);
                if (two in obj) {
                  obj[two]=obj[two]+1;
                }
                else {
                  obj[two] = 1;
                }
              }
            });
            var sortable = [];
            for (var keyword in obj) {
              if (!keyword.match("MeSH Term")) {
                sortable.push([keyword, obj[keyword]]);
              }
            }
            sortable.sort(function(a, b) {return b[1] - a[1]});
            var strOut;
            for(var c = 0 ; c < 10 ; c++) {
              strOut = strOut+sortable[c].join(": ")+"\n";
            }
            var actual = strOut.replace("undefined","MeSH Terms: Frequency\n");
            newDiv.text(actual);
            newDiv.slideToggle(1000);
            console.log(sortable);
          }
        });
      }
    });
  }

}
//bug: resizing window will reset the markers to init() display
//bug: markers are created relatively in right position, but not in absolute correct position
var scrolls = {
  init: function (target) { //build the scrollbar markers on document load
    //if (target == null) {
      if ($("#scrollDiv_0").length > 0) {
        $("#scrollDiv_0").remove();
      }
    //}
    var path = "#main > div > div.panel.content.document > div.surface.resource-view.content > div.nodes";
    //console.log($(path));
    docHeight = $(path).height();
    winHeight = $(window).height();
    console.log("doc " + docHeight + " win " + winHeight );
    var $scroll = $("<div>", {
      id: "scrollDiv_0",
      class: "scrollDiv"
    });
    var scrollPos = $(window).width() - 20;
    $scroll.css({
      position: "fixed",
      width: "20px",
      height: winHeight,
      left: scrollPos,
      top: 0,
      //"background-color": "#EBF5FF"
    });
    $scroll.appendTo(path);
    var $citMark = $("<div>", {
      class: "citMark"
    });
    if (target == null) {
      console.log("no scroll target");
      //top pos of element / doc height = x / window height
      //console.log($("a.citation_reference"));
      /*var refArr = ["citation","figure"];
      refArr.forEach(function(elem) {
        var arr = $("a."+elem+"_reference");
        for (c = 0; c < arr.length ; c++) {
          $citMark.attr("id",arr[c].dataset.id + "_divider_" +elem+ "Mark");
          var offset = $("[data-id="+arr[c].dataset.id+"]").offset();
          var scrollOffset = (offset.top * winHeight) / docHeight;
          $citMark.css({
            position:"fixed",
            width: "20px",
            height: "5px",
            left: scrollPos,
            top: scrollOffset,
          });
          if (elem == "citation") {
            $citMark.css({  "background-color": "rgba(11, 157, 217, 0.4)"});
          }
          if (elem == "figure") {
            $citMark.css({ "background-color": "rgba(145, 187, 4, 0.6)"});
          }
          $citMark.clone().appendTo("#scrollDiv_0");
        }
      });
      */
    }
    else {
      console.log("scroll target specified");
      $(".citMark").remove();
      if (target.match("citation")) {
        var elem = "citation";
      }
      if (target.match("figure")) {
        var elem = "figure";
      }
      var arr = $("a."+elem+"_reference");
      for (c = 0; c < arr.length ; c++) {
        var tempArr = arr[c].dataset.id.split("_divider_");
        if (tempArr[1] == target) {
          $citMark.attr("id",arr[c].dataset.id + "_divider_" +elem+ "Mark");

          var offset = $("[data-id="+arr[c].dataset.id+"]").offset();
          var scrollOffset = (offset.top * winHeight) / docHeight;
          $citMark.css({
            position:"fixed",
            width: "20px",
            height: "5px",
            left: scrollPos,
            top: scrollOffset,
          });
          if (elem == "citation") {
            $citMark.css({  "background-color": "rgba(11, 157, 217, 0.4)"});
          }
          if (elem == "figure") {
            $citMark.css({ "background-color": "rgba(145, 187, 4, 0.6)"});
          }
          $citMark.clone().appendTo("#scrollDiv_0");
        }
      }
    }
  },

  listener: function() {
    //var path = '#main > div > div.panel.content.document > div.surface.resource-view.content > div.nodes';
    $('.resource-reference').on('click', function(e) {
      console.log("money");
      if (e.target !== this) return;
      console.log("click found");
      //console.log($(this));
      var targetArr = $(this)[0].dataset.id.split("_divider_");
      var targetCit = targetArr[1];
      console.log(targetCit);
      scrolls.init(targetCit);
    });
  },

  viewTracker: function() { // viewport height/doc height = x/window hight
    console.log("viewtracker starting");
    var path = "#main > div > div.panel.content.document > div.surface.resource-view.content > div.nodes";
    var scrollPos = $(window).width() - 20;
    var $viewHeight = ($(window).height() / docHeight) * $(window).height();
    //var $viewWidth = $(window).width();
    var getViewport = function() {
    var $w = $(window);
    return {
        l: $w.scrollLeft(),
        t: $w.scrollTop(),
        w: $w.width(),
        h: $w.height()
      }
    }
    console.log($("#scrollDiv_0").position());
    var topScroll = getViewport();
    var topAdjust = (topScroll.t / docHeight) * $(window).height();
    var $view = $("<div>", {
      id: "inView",
    });
    $view.css({
      position: "fixed",
      height: $viewHeight,
      width: "20px",
      left: scrollPos,
      top: topAdjust + "px",
      "z-index": 100000,
      border: "2px solid"
    });
    $view.appendTo("#scrollDiv_0");
    //console.log($(path));
    $(window).scroll( function () {
      //console.log($("#scrollDiv_0").position());
      //console.log("scrolling");
      topScroll = getViewport();
      scrollPos = $(window).width() - 20;
      //console.log(topScroll);
      topAdjust = (topScroll.t / docHeight) * $(window).height();
      $viewHeight = ($(window).height() / docHeight) * $(window).height();
      //console.log(topAdjust);
      $("#inView").css({
        position: "fixed",
        height: $viewHeight,
        width: "20px",
        left: scrollPos,
        top: topAdjust + "px",
        "z-index": 100000,
        border: "2px solid"
      });
      $view.appendTo("#scrollDiv_0");
    });
  }


}


/*
$(function(){
    var windowH = $(window).height();
    var wrapperH = $('#wrapper').height();
    if(windowH > wrapperH) {
        $('#wrapper').css({'height':($(window).height())+'px'});
    }
    $(window).resize(function(){
        var windowH = $(window).height();
        var wrapperH = $('#wrapper').height();
        var differenceH = windowH - wrapperH;
        var newH = wrapperH + differenceH;
        var truecontentH = $('#truecontent').height();
        if(windowH > truecontentH) {
            $('#wrapper').css('height', (newH)+'px');
        }

    })
});
*/



var twitterListener = function () {
  window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return t;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};return t;}(document,"script","twitter-wjs"));
  console.log("twitter ran");
}


var linkKill = function() {
  $('a.resource-reference').click( function(e) {
    e.preventDefault();
    //e.preventPropagation();
  });
  //scrolls.init();
  $('a.action-toggle-resource').click( function(e) { //also actually initiates scroll maps
    e.preventDefault();
    var targeting = $(this).parent().parent().attr('data-id');
    console.log($(this).parent().parent().attr('data-id'));
    scrolls.init(targeting);
    //e.preventPropagation();
  });
}

var highlighter = {
  highlightInit: function() {
    console.log('ready');
    var hiObj = { 'pop': 'val'};
    var counter = 0;
    //console.log($('.content-node.paragraph > .content > .content-node.text > .content'));
    var hiArr = $('.content-node.paragraph > .content > .content-node.text > .content').map(function() {
      //console.log($(this).text()+"_divider_"+$(this).parent().attr('data-id'));
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
            //try to add all twitter buttons hidden **This did not work **
            //Try using qtip2 library to create new instances of twitter buttons
            //var spanId = "inline_"+key+"_"+counter;
            //var tweetId = spanId + "tweet";
            //var $btn = populator.twitter(spanId,tweetId);
            //$btn.appendTo($keeper);
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
    $( ".highlightable").click( function(e) {
      if (e.target !== this) return;
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
    $("span.highlightable").click( function(e) {
      if (e.target !== this) return;
      //reset reference arrays
      citArray = [];
      figArray = [];
      var spanId = $(this).attr('id');
      if ($("#"+spanId+"parent").length > 0) {
        //console.log("jumbo");
        $("#"+spanId+"parent").slideToggle(1000, function () {
          $(this).remove();
        });
        //return false;
      }
      if ($("#"+spanId+"tweet").length > 0) {
        $("#"+spanId+"tweet").hide(400, function() {
          //console.log($(this) + "remove tweet");
          $(this).remove();
        });
        return false;
      }
      //console.log(spanId);
      var resources = $('#'+spanId +' > a.resource-reference');
      var tweetId = spanId+"tweet";
      //$("#"+tweetId).toggle('slow');
      if (resources.length > 0) {
        //if resources exist, create arrays containing the article citation Ids of the target
        for (resCount=0 ; resCount < resources.length ; resCount++) {
          var toPush = resources[resCount].dataset.id.split("_divider_")[1];
          if (toPush.match("article_citation")) {
            citArray.push(toPush);
            //console.log(toPush);
          }
          if (toPush.match("figure")) {
            figArray.push(toPush);
          }
        }
        expands.createExpand(spanId);
      }
      populator.twitter(spanId,tweetId);
      $("#"+tweetId).toggle('slide');
    });
  },
  //function to create the expand div, but keep hidden until populated (display none in css)
  createExpand: function (spanId) {
    //console.log("expanding");
    var newDiv = $("<div>", {
      id: spanId + "parent",
      class: "expandParent"
    });
    newDiv.hide();
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
      newDiv.slideToggle(1000);
    }
  }
}

//methods for populating the expands
//*******need to add support for targets other than citations and figures (such as videos)
var populator = {
  citations: function(citId,citArray) {
    //to do: check for multiple instances
    citArray.forEach( function(elem) {
      //console.log($("[data-id='"+elem+"']"));
      $("[data-id='"+elem+"']:first").clone().show().appendTo("#"+citId);
    });
    linkKill(); //restate <a> disabling for the text within expands
  },
  figures: function(figId,figArray) {
    figArray.forEach( function(elem) {
      //console.log($("[data-id='"+elem+"']"));
      //adding array[0] specification to prevent cloned divs elsewhere in
      //the document from giving double hits.
      $("[data-id='"+elem+"']:first").clone().show().appendTo("#"+figId);
    });
    linkKill();
  },
  twitter: function(spanId,tweetId) {
    //twitterListener();
    $("body").removeAttr("data-twttr-rendered");
    var button = $("<a>", {
      href: "https://twitter.com/share",
      class: "twitter-share-button hidden",
      id: tweetId,
      "data-text": $("#"+spanId).text(),
      "data-url": window.location.href,
    });
    //console.log("thing");
    button.insertAfter("#"+spanId);
    twttr.widgets.load();
    //return button;
    //reset the body class added by the twitter button to only run once per page
    //$("body").removeAttr("data-twttr-rendered");

  }
}
