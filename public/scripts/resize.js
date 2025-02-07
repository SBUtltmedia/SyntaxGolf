$(window).resize(resizeWindow);
var aspect = 1/ 1.1;
let width = $("#sentenceContainer")
// console.log(width)
let test = 1
if (test = 1) {
  aspect = 1/0.8
}
if (/Android|webOS|iPhone|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  aspect = 9/16
}
if (/iPad|iPod/i.test(navigator.userAgent)) {
  aspect = 3/4
}
// var baseFontFactor = 0.016; // make this based on number of rows
// var baseFontFactor =  .02 - numberOfRows * 0.002;
// let baseFontFactor = .02;
var paddingFactor = 0.99;
var stageHeight,  stageWidth;
// $(()=>{resizeWindow()})

function resizeWindow() {
  var viewport =  $(window)
  var numberOfRows = $("#menu").attr("data-currentNumberOfRows");
  // var constituentSet = [...document.getElementById("row_id_0").children].map(x=>x.innerHTML)

  
  // console.log(numberOfRows);
  // console.log(viewport.width(),$(window).height(), $("#stage").css("height"))

  var w = window.innerWidth;
  var h = window.innerHeight;
// console.log(w,h)


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
    width: paddedStageWidth,
    height: paddedStageHeight,
    left: stageLeft + "px",
  });
  //console.log(stageLeft, stageTop)
  $("html").css("font-size", stageHeight*.01 + "px");
  $("#lineContainer").css({
    width: $("#problemConstituent").width(),
    height: $("#problemConstituent").height()
  });
  // console.log(numberOfRows)
  $("#sentenceContainer").css({"font-size":fontSize(numberOfRows) + "rem"});
  // $("#sentenceContainer").css("background-color", "blue");
  // $("#sentenceContainer").css("cssText", `font-size:${0.1*numberOfRows}rem !important;`);

  drawLines()
  drawArrows()

}

function fontSize(numberOfRows) {
  let shortest = 0.9;
  let longest = 10.5;
  let smallestFont = 0.40;
  let longestFont = 1.5;
  return ((smallestFont-longestFont)/(longest-shortest)*(numberOfRows-shortest))+(longestFont)
}

