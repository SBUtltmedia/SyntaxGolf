
let foundation = "#problemConstituent" // this should already exist in HTML

//let sentence = "Mary had a little lamb" // default sentence but can be replaced by input

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '').replaceAll("+"," ");
    }
    return query;
}
let bracketedSentence=parseQuery(window.location.search).string || 
    "(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))"
bracketedSentence = bracketedSentence.replace(/[\r\n]/g,'').replace(/  +/g, ' ')
//let sentence = treeToString(parse(bracketedSentence))
let sentence = bracketToString(bracketedSentence)

console.log(bracketedSentence)
console.log(sentence)
 

$(document).ready(function () {
    
    // "check answer" button at top, click to generate bracketed syntax to compare and grade
    $(`${foundation}`).append($("<div/>", {html:"Check Answer", class: "button"}).on({
        "click":function(e){
            if(getTree().replace(/  +/g, ' ') == bracketedSentence) {
                console.log("Correct!") 
                alert("Correct!")
            } else if(isValid(treeToRows(parse(bracketedSentence)), getRows())) {
                console.log("On the right track!")
                alert("On the right track!")
            } else {
                console.log("Incorrect :(")
                alert("Incorrect :(")
            }
        }
    }))

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
                selectedJQ.addClass("faded").removeClass("selected") // appear grey and can't be selected again
                // once all words in a block are parsed they disappear
                if(selectedJQ.parent().find(".faded").length == selectedJQ.parent().children().length) {
                    selectedJQ.parent().addClass("hidden")
                }
                console.log(selectedJQ.parent().find(".faded").length, selectedJQ.parent().children().length)
                
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
        }).css({"cursor":"pointer"}), 
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

    let callback = function(block){
        let parent = findParent($(this))
        drawLine($(this), parent)
    }
    traverse(callback)

}

function traverse(callback) {
    $(`${foundation}`).children().each(function(row){
        let rowThis = $(this)
        let rowIndex = parseInt(rowThis.data("row"))
        if (rowIndex > 0) { // skip root node           
            rowThis.children().each(callback)            
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
	$(line).attr({x1:`${pCenterXPercent}%`, y1:`${pbottomPercent}%`, x2:`${cCenterXPercent}%`, y2:`${ctopPercent}%`, syle:"stroke:rgb(255,0,0);stroke-width:2", class:"branch"})
    

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

    $(this).css({"cursor":"auto", "width":"20rem"})

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
            $(this).parent().parent().css({"width":"5rem"})
            $(this).parent().parent().text(label)
            console.log($(this).parent().parent().text()) // why is this not working?
            console.log($(this).parent())
            // $(this).parent().parent().css({"width":"3rem"})
            // $(this).parent().remove() // cannot be reopened due to .one({}) // redundant?
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

function getTree(){
    // when player clicks "done" 
    // get bracketed syntax representation of final syntax tree to compare to official answer

    // maps block IDs to list of IDs of its children
    let parentChildrenMap = getParentChildrenMap()

    // ID of block containing original sentence
    let root = $(`[data-row="0"]`).children()[0].id

    let tree = treeAtNode(root, parentChildrenMap)

    return tree
}

function getParentChildrenMap() {
    let PCM = {}
    let callback = function(block){
        let childID = $(this).attr("id")
        let parentID = findParent($(this)).attr("id")
        if(!(parentID in PCM)) {
            PCM[parentID] = []
        }
        PCM[parentID].push(childID)
    }
    traverse(callback)

    return PCM
}

function treeAtNode(blockID, PCM) {
    let node = $(`#${blockID}`)
    let label = node.find(".labelDiv").text()
    
    // base case: child is a string not another tree
    if(!(blockID in PCM)) {
        // let word = node.find(".constituentContainer").find(".wordContainer").text()
        // console.log(node.find(".constituentContainer").find(".wordContainer"))
        let word = node.find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer)=>{return wordContainer.innerHTML}).join(" ")
        // console.log(word)
        let leaf = `(${label} ${word})`
        return leaf
    } else {
        let childrenIDs = PCM[blockID]
        let children = ""
        childrenIDs.forEach((childID) => {
            children = `${children} ${treeAtNode(childID, PCM)}`
        })

        let tree = `(${label} ${children})`

        return tree
    }

}

function treeToString(tree) {
    if (typeof tree == "string") {

        return tree + ' '
    }
    else if (typeof tree.children == "string") {

        return tree.children //+ ' '
    }
    else if (Array.isArray(tree.children)) {

        return tree.children.reduce((acc, subtree) => {


            return acc + treeToString(subtree)
        }, "")
    }

}

function bracketToString(bracket) {
    return bracket
    .replace(/  +/g, ' ') // get rid of extra white spaces
    .replace(/\([^ ]* /g, '') // get rid of left parenthesis and label
    .replace(/\)/g, '') // get rid of right parenthesis
}

function isValidTest() {
    let tree = parse(`(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))`)
    //let subtree = JSON.stringify(parse(getTree()))
    // let subtree = JSON.parse('{"label":"S","children":[{"label":"NP","children":"Mary"}]}')
    let subtree = JSON.parse('{"label":"S","children":[{"label":"NP","children":"Mary"},{"label":"VP","children":"had a little lamb"}]}')
    return isValid(tree, subtree)

    // created new file to test all valid subtrees and some invalid ones
    // this is outdated now
}
//isValidTest()


function treeToRows(tree, accumulator=[], row=0, index=0) {

    // TO DO modify to include "column"

    // a = {"label":"S","children":[{"label":"NP","children":"Mary"},
    // {"label":"VP","children":[{"label":"V","children":"had"},{"label":"NP","children":[
    //     {"label":"D","children":"a"},{"label":"N'","children":[{"label":"Adj","children":"little"},
    //     {"label":"N","children":"lamb"}]}]}]}]}

    accumulator[row] = accumulator[row] || []

    //base case
    //string child
    if (!Array.isArray(tree.children)) {
        accumulator[row].push({label:tree.label, constituent:tree.children, column:index})
        console.log(tree.children, index)
        // console.log(tree.label)
        return tree.children
    } else {
        let constituent = []
        tree.children.forEach(function(child, i){
            console.log(child, i)
            //treeToRows(child, accumulator, row+1)
            constituent.push(treeToRows(child, accumulator, row+1, i+index))
            // let word = treeToRows(child, accumulator, row+1)
            // console.log(word)
            // constituent.push(word)
        })
        accumulator[row].push({label:tree.label, constituent:constituent.join(" "), column:index})
        console.log(constituent.join(" "), index)
        if(row==0){
            return accumulator
        } else {
            return constituent.join(" ")
        }
    }
    
}

function getRows() {
    // makes row structure with labels and constituents from DOM
    let structure = []
    $(`${foundation}`).find("[data-row]").each(function(row){
        structure[row] = []
        // console.log(row)
        console.log($(this))
        $(this).children().each(function(block){
            // console.log(block)
            console.log($(this))
            let label = $(this).find(".labelDiv").text()
            console.log(label)
            let constituent = $(this).find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer)=>{return wordContainer.innerHTML}).join(" ")
            console.log(constituent)
            structure[row].push({label:label, constituent:constituent, column:$(this).data("index")})
            console.log($(this).data("index"))
        })
    })
    return structure
}

function isValid(tree, subtree) {
    //update to take into account columns

    // console.log(tree)
    // console.log(subtree)
    let flag = true
    subtree.forEach(function(row, i){
        row.forEach(function(c){
            // check for matching constituent
            if(!(tree[i].some(x => x.constituent === c.constituent))){
                flag = false
                console.log(false)
                // is there a way to break out of the loops?
            } 
            else {
                // check label
                console.log(true)
                tree[i].forEach(function(x) {
                    if(x.constituent == c.constituent & !(c.label == "?" || x.label == c.label)) {
                        flag = false
                        console.log(false, x)
                        // this method of "wrong label" doesn't work for buffalos
                    }
                })
            }
            
        })
    })
    return flag

}