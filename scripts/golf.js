
let foundation = "#problemConstituent" // this should already exist in HTML
let sentence = "Mary had a little lamb" // default sentence but can be replaced by input 

$(document).ready(function () {
    $(`${foundation}`).append($("<div/>", {"data-row":0})) // start with just row 0 div
    makeSelectable(sentence, 0, 0) // this will allow highlighting/selecting, parsing through recursion
    $("#stage").on({ 
        mousedown: function (e) {
            e.stopPropagation();
            $(".selected").removeClass("selected"); // clicking anywhere else deselects
        }
    })
})

// functions
function makeSelectable(sentence, row, blockIndex) {
    // sentence is a string of words
    // row is the number of the div to put these words into
    // index is the position in the row, the initial index of the first word
    if (!($(`[data-row="${row}"]`)).length) { 
        // create row div if it doesn't exist
        $(`${foundation}`).append($("<div/>", {"data-row":row}))
    }

    let sentenceArray = [] // will fill with words from sentence then be converted to string
    sentence.split(' ').forEach((word, index) => {
        let wordContainer = $("<div/>", { html: word, "data-index":index, class: "wordContainer" }).on({

            mousemove: function (e) {
                if (e.buttons == 1) {
                    selected(this)
                }
            },

            // for mobile compatibility

            "touching": function(e) {
                selected(this)
            },

            "touchmove": function(e) {
                let elem = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
                $(elem).trigger("touching")               
            }
        });
        sentenceArray.push(wordContainer); // at end of loop, will contain all words in current constituent
    })

    // put constituent block div in proper row div

    // get unique ID from timestamp
    let blockID = Date.now();

    let blockDiv = $("<div/>",{id:blockID, "data-index":blockIndex, class:"block"}).on({

        mousedown: function (e) {
            let clickedID = $(this).attr("id")
            let selectedJQ = $(`#${clickedID} .selected`)
            e.stopPropagation();
            if (selectedJQ.length) {
                let selectedWords = selectedJQ
                selectedJQ.addClass("faded").removeClass("selected") // eventually should be hidden and/or unable to be selected again
                let constituent = sentenceArrayToSentence(selectedWords)
                newIndex = blockIndex + parseInt(selectedWords[0].dataset.index)
                
                makeSelectable(constituent, row+1, newIndex); 
                
                resizeWindow()
                // redraw SVG based on new child
                drawLines();
            }
        }

    }).append([
        $("<div/>", {class:"labelDiv", html:"?"}).one({
            "click":generateMenu
        }), 
        $("<div/>", {class:"constituentContainer"}).append(sentenceArray)])
    

    // testing drawing
    //drawDot(blockDiv)

    // actually put the constituent on the page
    // prepend to first div whose index is greater

    if ($(`[data-row="${row}"]`).children().length) {
        let greatest = true
        $(`[data-row="${row}"]`).children().each(function(item){
            if(blockIndex < $(this)[0].dataset.index) {
                blockDiv.insertBefore($(this))
                greatest = false
                return false
            }
            if (greatest) {
                $(`[data-row="${row}"]`).append(blockDiv)
            }
        })
    } else {
        $(`[data-row="${row}"]`).append(blockDiv)
    }
    
}

function selected(el) {
    let thisBlockID = $(el).parent().parent().attr("id")
    
    if ($(".selected").length) {
        selectedID = $($(".selected")[0]).parent().parent().attr("id")
        if (thisBlockID != selectedID) {
            return
        }

    }
    if (!$(el).hasClass("faded")){ 
        $(el).addClass("selected"); // highlights in turquoise
    } 
}

function sentenceArrayToSentence(sentenceArray) {
    return $.makeArray(sentenceArray).map(wordDiv=>wordDiv.innerHTML).join(" ");
}

function drawLines() {
    // clear current SVG
    $("#lineContainer").empty()
    // go through parent child pairs and draw all lines between them
    // children of foundation
    $(`${foundation}`).children().each(function(row){
        let rowThis = $(this)
        let rowIndex = parseInt(rowThis.data("row"))
        if (rowIndex > 0) { // skip root node           
            rowThis.children().each(function(block){
                let parent = findParent($(this))
                drawLine($(this), parent)
            })
            
        }
        
    })

}

function findParent(block) {
    // row is row before row of block, look there for parent
    let parent = -1
    rowIndex = parseInt(block.parent().data("row"))
    row = $(`[data-row="${rowIndex-1}"]`)
    row.children().each(function(){
        if($(this).data("index") > $(block).data("index")){
            return false
        }
        parent = $(this)
    })
    return parent
}

function drawLine(child, parent) {
    // takes jquery items

    let containerWidth = $("#lineContainer").width()
    let containerHeight = $("#lineContainer").height()
    
    let [pleft, ptop, pright, pbottom] = getCorners(parent)
    let pCenterX = (pleft+pright) / 2
    let pCenterXPercent = pCenterX / containerWidth * 100
    let pbottomPercent = pbottom / containerHeight * 100
    // start of line will be (pCenterXPercent, pbottomPercent)
    
    let [cleft, ctop, cright, cbottom] = getCorners(child)
    let cCenterX = (cleft+cright) / 2
    let cCenterXPercent = cCenterX / containerWidth * 100
    let ctopPercent = ctop / containerHeight * 100
    // end of line will be (cCenterXPercent, ctopPercent)

    // x1 pCenterXPercent, y1 pbottomPercent, x2 cCenterXPercent, y2 ctopPercent
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    $("#lineContainer").append(line);
	$(line).attr({x1:`${pCenterXPercent}%`, y1:`${pbottomPercent}%`, x2:`${cCenterXPercent}%`, y2:`${ctopPercent}%`, style:"stroke:rgb(255,0,0);stroke-width:2"})
    

}

function drawDot(elem) {
    let containerWidth = $("#lineContainer").width()
    let containerHeight = $("#lineContainer").height()
    let {left, top, right, bottom} = getCorners(elem)
    let centerX = (left+right) / 2
    let centerY = (top+bottom) / 2
    let centerXPercent = centerX / containerWidth * 100
    let centerYPercent = centerY / containerHeight * 100

    let word = elem[0].innerHTML

    var shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape);
	$(shape).attr({cx:`${centerXPercent}%`, cy:`${centerYPercent}%`, r:"0.4%", "data-word":word});

    // testing putting dots in upper left and bottom right
    let leftPercent = left / containerWidth * 100
    let topPercent = top / containerHeight * 100
    var shape2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape2);
    $(shape2).attr({cx:`${leftPercent}%`, cy:`${topPercent}%`, r:"0.4%", "data-word":word});

    let rightPercent = right / containerWidth * 100
    let bottomPercent = bottom / containerHeight * 100
    var shape3 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape3);
    $(shape3).attr({cx:`${rightPercent}%`, cy:`${bottomPercent}%`, r:"0.4%", "data-word":word});

    // put dots where start and end of lines would be
    // x center, y bottom and x center, y top
    var shape4 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape4);
    $(shape4).attr({cx:`${centerXPercent}%`, cy:`${bottomPercent}%`, r:"0.4%", "data-word":word});
    var shape5 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape5);
    $(shape5).attr({cx:`${centerXPercent}%`, cy:`${topPercent}%`, r:"0.4%", "data-word":word});


}

function getCorners(elem) {
    let width = elem[0].offsetWidth
    let height = elem[0].offsetHeight
    let left = elem.position().left
    let top = elem.position().top
    let right = left + width
    let bottom = top + height
    
    return Object.values({left, top, right, bottom})
}

function generateMenu() {

    let labels = ["N", "V", "P", "Adj", "Adv", "D", "C", "T", "S"]

    let typeMenu = $("<div/>", {class:"typeMenu"}).append(
        [$("<div/>", {class:"typeItem", html:"'"}), $("<div/>", {class:"typeItem", html:"P"})])

    let labelDivArray = []

    for (i of labels) {
        labelDivArray.push($("<div/>", {html:i, class:"labelItem"}))
    }

    $(this).append($("<div/>", {class:"labelMenu"}).append([...labelDivArray, typeMenu]))

    drawLines()

    let symbolMap = {"'":"bar", "P":"phrase"}

    $(this).find(".typeItem").on({
        "click":function(e) {
            let labelHTML = $(this).html()
            for (symbol of Object.keys(symbolMap)) {
                if (symbol!=labelHTML) {
                    $(this).parent().parent().find(".labelItem").removeClass(symbolMap[symbol])
                }
            }
            $(this).parent().parent().find(".labelItem").toggleClass(symbolMap[labelHTML])

        }
    })

    $(".labelItem").on({
        "click":function(e) {
            let classes = new Set($(this).attr("class").split(" "))
            let types = new Set(Object.values(symbolMap))
            let intersect = [...classes].filter(i => types.has(i))[0] || ""
            let symbol = inverse(symbolMap)[intersect] || ""
            let label = $(this).html() + symbol
            // replace ? with label and close menu
            $(this).parent().parent().text(label)
            $(this).parent().remove() // cannot be reopened due to .one({})
            drawLines()

        }
    })

}

function inverse(obj){
    var retobj = {};
    for(var key in obj){
      retobj[obj[key]] = key;
    }
    return retobj;
}