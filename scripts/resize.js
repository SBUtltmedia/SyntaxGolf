$(window).resize(resizeWindow);

var aspect = 1/ 1;
var baseFontFactor = 60;
var paddingFactor = .9;
var stageHeight,  stageWidth;
$(()=>{resizeWindow()})
function resizeWindow() {
  var viewport =  $(window)
  console.log(viewport.width(),$(window).height(), $("#stage").css("height"))

var w= viewport.width() ;
var h= viewport.height();



  var calcw = w;
  var calch = h;
  if (w/h>=aspect) {
    stageHeight = calch;
    stageWidth = (aspect) * calch;

  }
else{

  stageHeight =  calcw/aspect;
  stageWidth =  calcw ;

}
    stageLeft = (calcw - stageWidth*paddingFactor) / 2;
  //stageLeft = stageWidth / 2;
  stageTop = 0;

  let paddedStageWidth = `${stageWidth*paddingFactor}px`
  let paddedStageHeight = `${stageHeight*paddingFactor}px`

  $("#stage").css({
    // width: paddedStageWidth,
    // height: paddedStageHeight,
    // left: stageLeft + "px",
  });
  //console.log(stageLeft, stageTop)
  $("html").css("font-size", (stageHeight / baseFontFactor) + "px");
  $("#lineContainer").css({
    width: paddedStageWidth,
    height: $("#problemConstituent").height()
  });

}
