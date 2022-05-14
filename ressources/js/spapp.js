if (!location.hash) {
        location.hash = '#index';
}
//custom event IE polyfill
(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   };

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();

(function(window){

  var pageHandlers = {};

  var currentPageName = null;
  var oldPageName = null;
  var $currentPage = null;

  function show(pageName,param) {
    var $page = document.querySelector("section#" + pageName);
    if( $page.length == 0 ) {
      console.warn("section with id=%s not found!",pageName);
      return;
    }
    var modal = $page.classList.contains('modal');
    var ph = pageHandlers[pageName];
    if( ph ) {
      var that = $page.length > 0 ? $page[0] : null;
      var r = ph.call(that , param);
      if( typeof r == "function" ) { // it returns the function that's used for view rendering
        if(!$page.hasAttribute('[no-ctl-cache]')) //for non cached section
            pageHandlers[pageName] = r;
        r.call(that, param); // call that rendering function
      }
    }
    if(currentPageName) { // "close" current page view
      //
      if (modal!==true){ //when modal, keep currentPage in background
        document.body.classList.remove(currentPageName); // remove old page class

      }
      if($currentPage) {
        document.dispatchEvent(new CustomEvent('page.hidden',{'currentPage' : currentPageName }));
        if($currentPage.hasAttribute('[no-ctl-cache]')) $currentPage.innerHTML = null;
      }
    }
    oldPageName = currentPageName;
    document.body.classList.add(currentPageName = pageName); // set new page class



    if($currentPage = $page){

      document.dispatchEvent(new CustomEvent('page.shown', {'detail' : {'currentPage' : currentPageName, 'title': $page.getAttribute('title')}}));
      //update url location when access pages via code
      if (!$page.hasAttribute('default') && !modal){
        var url = '#' + currentPageName;
        if (param && typeof(param)!=='object') //don't display object in url
          url += ':' + param;

        if (location.hash!==url){
          history.pushState(null, null, url);
        }
      }
    }
  }

  function app(pageName,param) {

    var $page = document.body.querySelector("section#" + pageName);
    if(!$page){
      console.error('page' + pageName + ' is not declared has a section');
    }
    var src = $page.getAttribute("src");
    if( src && !$page.hasChildNodes()) { // it has src and is empty
      app.get(src, $page, pageName, param);
    } else
      show(pageName,param);
  }

  app.back = function(params){
    app(oldPageName, params);
  }
  // Registration of page's handler function - scope initializer and controller
  app.page = function(pageName, handler) {
     pageHandlers[pageName] = handler;
    };

  // Function to get page's html, shall return jQuery's promise. Can be overriden.
  // Function to get page's html, shall return jQuery's promise. Can be overriden.
  app.get = function(src,$page,pageName, param, modal) {
    //return $.get(src, "html");
    var request = new XMLHttpRequest();
    request.open('GET', src, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        $page.innerHTML = request.responseText;
        $script = $page.querySelector('script');
        if ($script){
          eval($script.text);
        }
        show(pageName,param, modal);
      } else {
        // We reached our target server, but it returned an error
        console.warn("failed to get %s page!",pageName);
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      console.warn("failed to get %s page!",pageName);
    };

    request.send();
  };

  function onhashchange()
  {
    var hash = location.hash || ("#" + document.querySelector('section[default]').getAttribute('id'));

    var re = /#([-0-9A-Za-z]+)(\:(.+))?/;
    var match = re.exec(hash);
    hash = match[1];
    var param = match[3];
    app(hash,param);
  }

  window.addEventListener('hashchange', onhashchange);

  window.app = app;

  setTimeout(onhashchange);

})(this);

/*Drag and drop*/
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
  checkValue(data);
}

function checkValue(imgName){
    if(!($('#player1').is(':empty'))){
        $("#player2InputName").removeAttr("disabled");
        var player2Att = document.getElementById("player2");
        var att = document.createAttribute("ondragover");
        att.value = "allowDrop(event)";
        player2Att.setAttributeNode(att);
    }

    if((!($('#player1').is(':empty'))) && $('#player2').is(':empty')) {
        document.getElementById("p1Img").value = imgName;
        return;
    }
    if(!($('#player1').is(':empty')) && !($('#player2').is(':empty'))){
        document.getElementById("p2Img").value = imgName;
        return;
    }
}
function sub () {
    if((!($('#player1').is(':empty'))) && !($('#player2').is(':empty'))) {
        document.getElementById("formulaire").setAttribute("action","index.html#game");
    }
}

