/*jshint multistr: true */

//this is a sample .js file that shows how you might set up the popup menus


function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '').replaceAll("+"," ");
    }
    return query;
}
let braketedSentence=parseQuery(window.location.search).string
console.log(braketedSentence)
let lines = [];
let currentLine = 0; 
(function ($) {
	$(document).ready(function () {

		var label = `<div>
							  <a><i>NP</i></a>
							  <a><i>VP</i></a>
						      <a><i>V</i></a><br>
							  <a><i>N</i></a>
							  <a><i>PP</i></a>
							  <a><i>D</i></a><br>
							  <a><i>P</i></a>
						  </div>`;
		const tree = {
			"children": [
				{
					"label": "NP",
					"children": "Col Mustard"
				},
				{
					"label": "VP",
					"children": [
						{
							"label": "V",
							"children": "locked"
						},
						{
							"label": "NP",
							"children": "Miss Scarlet"
						},

						{
							"label": "PP",
							"children": [
								{
									"label": "P",
									"children": "In"
								},

								{
									"label": "D",
									"children": "the"
								},
								{
									"label": "N",
									"children": "library"
								}

							]
						}

					]
				}
			]
		}
	

		makeTree(parse(braketedSentence), "container", 0, 100)
		$(`#container`).children().find("div").fadeTo(0,0)

		revealText("container_0")
		
		function revealSelect(parentId,childId){


		$(`#${parentId}_${childId}`).find('[id*="select"]').fadeTo(1000,1)
		
		$(`#${parentId}_${childId}`).find('[id*="select"]').parent().fadeTo(1000,1)
		$(`#${parentId}_${childId}`).fadeTo(1000,1)
		//$(`#${parentId}_${childId}`).children().fadeTo(1000,1)

		}

		function revealText(parentId){
			$(`#${parentId}`).fadeTo(1000,1)
			$(`#${parentId}`).children().fadeTo(1000,1)
		}
		// $("#container_0").find("div").show()
		// const sentence = ` ${treeToString(tree)} `;
		// //call popup, pass through options
		// //call popup on the element the popup will be attached to
		// //this one calls all menu elements with a name="menu1" and would attach the same menu to each.
		// lines[currentLine] = createNewLine();
		// lines[currentLine].append(createSelectionPick(sentence));
		// $('#container').append(lines[currentLine]);
		// currentLine++
		// lines[currentLine] = createNewLine();
		// $('#container').append(lines[currentLine])
		// function createNewLine() {
		// 	return $('<div/>');

		// };
		function makeTree(tree, parent, index, cssWidth) {
			let newParent = `${parent}_${index}`
			let select=`${newParent}_select`
			$(`#${parent}`).append(
				$('<div/>', {  "style": `text-align:center;width:${cssWidth}%` }).append(
					$('<div/>', { "id": `${newParent}`, "style": `white-space:nowrap`, "data-tree": JSON.stringify(tree) }).append(
						[
						$("<div/>", { "style": "justify-content: center;width:100%" }).append(
						$("<div/>", { "style": "justify-content: center;width:1.5em;height:1.5em;", "id":select})),	
						createSelectionPick(treeToString(tree))
				
						]
																																  )
																						)
								)
			//connect(getId(parent),getId(newParent),"red",1)
			createTypePick(select)
			if (typeof tree.children == "string") {
				//	makeTree(tree.children,newParent,0)
			}
			else if (typeof tree == "string") {

			}
			else {
				let cssWidth = Math.floor(100 / tree.children.length);
				tree.children.forEach((child, childIndex) => {


					let cssWidth = Math.floor(100 / tree.children.length)-6;
					makeTree(child, newParent, childIndex, cssWidth)
				

				})
			}

		}
		function createSelectionPick2(sentence, anchorOffset = 0) {
			let phraseDiv = $('<div/>', {});
			let wordSpan= sentence.split(" ").map((word,index)=>{

				return  $('<span/>', {"html":`${word} `});


			})

			phraseDiv.on('keyup mouseup mouseleave', function (e) {
				GetSelectedText();
				let sentence= rangy.getSelection().toString().trim()
				let tree=JSON.parse($(this).parent().attr('data-tree'))
		
				tree.children.forEach((child,index)=>{
					let childText= treeToString(child).trim()
					console.log({childText,sentence})
					if(childText==sentence){
						console.log($(this).parent().attr("id"),index)
						revealSelect($(this).parent().attr("id"),index)
					};

				})
			});
			return phraseDiv;
		}

		function createSelectionPick(sentence, anchorOffset = 0) {
			let phraseDiv = $('<div/>', {
				"contenteditable": "true",
				"oncut": "return false",
				"onpaste": "return false",
				"style": "justify-content: center;width:100%",
				"onkeydown": 'if(event.metaKey) return true; return false;',
				"data-anchorOffset": anchorOffset,
				// "class":"displayBox",
				"html": sentence.replaceAll("<[^>]*>", "")
			});
			phraseDiv.on('keyup mouseup mouseleave', function (e) {
				GetSelectedText();
				let sentence= rangy.getSelection().toString().trim()
				let tree=JSON.parse($(this).parent().attr('data-tree'))
		
				tree.children.forEach((child,index)=>{
					let childText= treeToString(child).trim()
					console.log({childText,sentence})
					if(childText==sentence){
						console.log($(this).parent().attr("id"),index)
						revealSelect($(this).parent().attr("id"),index)
					};

				})
			});
			return phraseDiv;
		}
		function GetSelectedText() {
			if (rangy.getSelection().toString()) {
				var t = '';
				if (window.getSelection) // FF4 with one tab open?
				{
					var rng = window.getSelection().getRangeAt(0);
					expandtoword(rng);
					t = rng.toString();
				}
				else
					if (document.getSelection) // FF4 with multiple tabs open?
					{
						var rng = document.getSelection().getRangeAt(0);
						expandtoword(rng);
						t = rng.toString();
					}
					else if (document.selection) // IE8
					{
						var rng = document.selection.createRange();
						// expand range to enclose any word partially enclosed in it
						rng.expand("word");
						t = rng.text;
					}

				// convert newline chars to spaces, collapse whitespace, and trim non-word chars
				return t.replace(/\r?\n/g, " ").replace(/\s+/g, " ").replace(/^\W+|\W+$/g, '');
			}
		}
		// expand FF range to enclose any word partially enclosed in it
		function expandtoword(range) {
			if (range.collapsed) {
				return;
			}

			while (range.startOffset > 0 && range.toString()[0].match(/\w/)) {
				range.setStart(range.startContainer, range.startOffset - 1);
			}

			while (range.endOffset < range.endContainer.length && range.toString()[range.toString().length - 1].match(/\w/)) {
				range.setEnd(range.endContainer, range.endOffset + 1);
			}
		}
		function treeToString(tree) {
			//console.log(typeof tree.children,tree )
			if (typeof tree == "string") {

				return tree + ' '
			}
			else if (typeof tree.children == "string") {

				return tree.children + ' '
			}
			else if (Array.isArray(tree.children)) {

				return tree.children.reduce((acc, subtree) => {


					return acc + treeToString(subtree)
				}, "")
			}
			//else console.log(JSON.stringify(tree))
			//else return tree.children.reduce((acc, subtree) => acc + treeToString(subtree), "")
		}

		// createParsePick('#root', sentence)

		// function createParsePick(el, sentence) {
		// 	console.log(el, sentence)
		// 	let parentEl = el;
		// 	let parse = sentence.split(" ").map((word, wordIndex) => {
		// 		return $('<div/>', { "html": word, "class": "parse" }).append($('<div/>', { "html": "<p>X ", "class": "cut", "data-index": wordIndex }))

		// 	})

		// 	$(`${el}`).append(parse)
		// 	$('.cut').on("click", picked)
		// 	function picked(el) {
		// 		let currentIndex = $(el.currentTarget).data("index")
		// 		let newLineId = `${parentEl}_${currentIndex}`;
		// 		$('#root').append($('<div/>', { "id": newLineId.split("#")[1], "class": "displayBox" }))

		// 		let cut = [sentence.split(" ").slice(0, currentIndex).join(" "), sentence.split(" ").slice(currentIndex).join(" ")];
		// 		[0, 1].forEach((index) => {
		// 			let newId = `${parentEl}_${index}`;
		// 			console.log(cut[index])
		// 			$(newLineId).append($('<div/>', { "id": newId.split("#")[1], "class": "displayBox" }))
		// 			createParsePick(`${newId}`, cut[index])

		// 		})


		// 	}
		// }

		function createTypePick(elId) {
			$(`#${elId}`).popup({
				content: label,

				position: "top",

				theme: "popupTheme popupThemeRed",

				style: "Red",

				animation: "flip",

				event: "click",

				hideOnClick: true,

				zIndex: 100,

				popItemClick: function (globalThis) {
					console.log($(event.target))
					if($(event.target).is(":visible")){
				
					let label = JSON.parse($(`#${elId}`).parent().parent().attr("data-tree")).label
					var content;

					var container = $(event.target).html();
					if(container==label){
						$(`#${elId}`).html(container)
						revealText($(`#${elId}`).parent().parent().attr("id"))
						console.log($(`#${elId}`).parent().parent().attr("id"))
					}
					else{
						$(`#${elId}`).html("?")
					}


				}

				}
				
			});
			$(`#${elId}`).html("?")

		}}
	);
}(jQuery));


function getId(id) {
	const el = document.getElementById(id);
	if(!el) console.log(`cannot find #${id}`);
	return el;
  }
  
  function getOffset( el ) {
	  console.log(el)
	  var rect = el.getBoundingClientRect();
	  return {
		  left: rect.left + window.pageXOffset,
		  top: rect.top + window.pageYOffset,
		  width: rect.width || el.offsetWidth,
		  height: rect.height || el.offsetHeight
	  };
  }
  
  function connect(div1, div2, color, thickness) { // draw a line connecting elements
	  var off1 = getOffset(div1);
	  var off2 = getOffset(div2);
	  // bottom right
	  var x1 = off1.left + off1.width;
	  var y1 = off1.top + off1.height;
	  // top right
	  var x2 = off2.left + off2.width;
	  var y2 = off2.top;
	  // distance
	  var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
	  // center
	  var cx = ((x1 + x2) / 2) - (length / 2);
	  var cy = ((y1 + y2) / 2) - (thickness / 2);
	  // angle
	  var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
	  // make hr
	  var htmlLine = "<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
	  //
	  // alert(htmlLine);
	  document.body.innerHTML += htmlLine;
  }
  