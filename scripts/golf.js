
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
                //selected(this) 
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
            console.log($(this))
            let clickedID = $(this).attr("id")
            let selectedJQ = $(`#${clickedID} .selected`)
            console.log(selectedJQ)
            console.log(`#${clickedID} .selected`)
            e.stopPropagation();
            if (selectedJQ.length) {
                let selectedWords = selectedJQ
                selectedJQ.addClass("faded").removeClass("selected") // eventually should be hidden and/or unable to be selected again
                let constituent = sentenceArrayToSentence(selectedWords)
                newIndex = blockIndex + parseInt(selectedWords[0].dataset.index)
                //$("#lineContainer").empty()
                // $(".wordContainer").each(function(){
                //     drawDot($(this))
                // })
                
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

    //$(`[data-row="${row}"]`).append(blockDiv); 
    console.log($(`[data-row="${row}"]`).children().length)
    if ($(`[data-row="${row}"]`).children().length) {
        let greatest = true
        $(`[data-row="${row}"]`).children().each(function(item){
            console.log($(this)[0].dataset.index)
            console.log(blockIndex)
            if(blockIndex < $(this)[0].dataset.index) {
                console.log("insert")
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
    console.log(thisBlockID)
    
    if ($(".selected").length) {
        console.log($($(".selected")[0]))
        console.log($($(".selected")[0]).parent().parent().attr("id"))
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
        console.log(row)
        let rowIndex = parseInt(rowThis.data("row"))
        console.log(rowIndex)
        if (rowIndex > 0) { // skip root node           
            rowThis.children().each(function(block){
                console.log($(this))
                //let aboveRow = $(`[data-row="${rowIndex-1}"]`)
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
    console.log(rowIndex)
    console.log(block.parent())
    console.log(block)
    row = $(`[data-row="${rowIndex-1}"]`)
    row.children().each(function(){
        if($(this).data("index") > $(block).data("index")){
            return false
        }
        console.log("found parent")
        parent = $(this)
    })
    return parent
}

function drawLine(child, parent) {
    // takes jquery items
    console.log("drawing")
    console.log(parent)

    let containerWidth = $("#lineContainer").width()
    let containerHeight = $("#lineContainer").height()
    // let parentWidth = parent.width()
    // let parentHeight = parent.height()
    // let parentLeft = parent.position().left
    // let parentTop = parent.position().top
    // let parentCenterX = parentLeft + (parentWidth / 2)
    // let parentCenterY = parentTop + (parentHeight / 2)
    // let parentCenterXPercent = parentCenterX / containerWidth * 100
    // let parentCenterYPercent = parentCenterY / containerHeight * 100
    let [pleft, ptop, pright, pbottom] = getCorners(parent)
    // console.log(getCorners(parent))
    // console.log(pleft, ptop, pright, pbottom)
    let pCenterX = (pleft+pright) / 2
    let pCenterXPercent = pCenterX / containerWidth * 100
    let pbottomPercent = pbottom / containerHeight * 100
    // start of line will be (pCenterXPercent, pbottomPercent)
    
    let [cleft, ctop, cright, cbottom] = getCorners(child)
    // console.log(cleft, ctop, cright, cbottom)
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

    console.log(word)

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
    // let width = elem.width()
    // let height = elem.height()
    let width = elem[0].offsetWidth
    console.log(width)
    let height = elem[0].offsetHeight
    let left = elem.position().left
    console.log(left)
    let top = elem.position().top
    let right = left + width
    let bottom = top + height
    console.log(left, top, right, bottom)
    
    return Object.values({left, top, right, bottom})
}

function generateMenu() {
    console.log($(this))
    

    let labelTree = {items:[
        {label:"N", items:[{label:"N'"}, {label:"NP"}]}, 
        {label:"V", items:[{label:"V'"}, {label:"VP"}]}, 
        {label:"P", items:[{label:"P'"}, {label:"PP"}]}, 
        {label:"D", items:[{label:"D'"}, {label:"DP"}]}, 
        {label:"C", items:[{label:"C'"}, {label:"CP"}]}, 
        {label:"T", items:[{label:"T'"}, {label:"TP"}]}
    ]} // not needed?
    // add Adj, Adv, and S (but no S' or SP)

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
            console.log(labelHTML)
            for (symbol of Object.keys(symbolMap)) {
                if (symbol!=labelHTML) {
                    console.log(symbol, labelHTML)
                    $(this).parent().parent().find(".labelItem").removeClass(symbolMap[symbol])
                }
            }
            console.log($(this))
            console.log($(this).parent().parent().find(".labelItem"))
            $(this).parent().parent().find(".labelItem").toggleClass(symbolMap[labelHTML])

        }
    })

    $(".labelItem").on({
        "click":function(e) {
            console.log($(this).attr("class"))
            console.log($(this).attr("class").split(" ").length)
            let classes = new Set($(this).attr("class").split(" "))
            let types = new Set(Object.values(symbolMap))
            let intersect = [...classes].filter(i => types.has(i))[0] || ""
            console.log({intersect, classes, types})
            let symbol = inverse(symbolMap)[intersect] || ""
            console.log(symbol)
            console.log($(this).html())
            console.log($(this).html() + symbol)
            let label = $(this).html() + symbol
            // replace ? with label and close menu
            console.log($(this).parent().parent().text())
            $(this).parent().parent().text(label)
            console.log($(this).parent().parent().text())
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