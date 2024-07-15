
let foundation = "#problemConstituent"
let menu = "#menu"
let wrongAnswers = [];
//let sentence = "Mary had a little lamb" // default sentence but can be replaced by input

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '').replaceAll("+", " ");
    }
    //console.log(query)
    return query;
}
let startingSentence = parseQuery(window.location.search).string ||
    "(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))"
    startingSentence = startingSentence.replaceAll("[","(").replaceAll("]",")");
    startingSentence = startingSentence.replace(/[\r\n]/g, '').replace(/  +/g, ' ')
//let sentence = treeToString(parse(bracketedSentence))
let sentence
let mode = parseQuery(window.location.search).mode || 'manual'
let steps
let par
let positivePoint

//console.log(bracketedSentence)
//console.log(sentence)


$(document).ready(init)

function init() {
    let problemSet = parseQuery(window.location.search).problemSet || 1
    fetch(new Request(`problem_${problemSet}.json`))
      .then((response) => response.json())
      .then((data) => {
        loadMenu(data)
        loadSentence(startingSentence)
      })
}

function loadMenu(problemJSON) {
    if (mode == 'manual') {
        $(menu).append($("<div/>", { html: "Check Answer", class: "button" }).on({
            "click": function (e) {
                if (getTree().replace(/  +/g, ' ') == bracketedSentence) {
                    //console.log("Correct!") 
                    alert("Correct!")
                } else if (isValid(treeToRows(parse(bracketedSentence)), getRows())) {
                    //console.log("On the right track!")
                    alert("On the right track!")
                } else {
                    //console.log("Incorrect :(")
                    alert("Incorrect :(")
                }
            }
        }))
    } else { // display steps in automatic mode
        $(menu).append($("<div/>", {id: "points"}))
    }
    let flagMapping = {"completed": "green"}
    problemJSON.forEach((problem, i) => { 
        let progress = flagMapping[problem.progress] || "yellow";
        // let flag = $(document.createElementNS("http://www.w3.org/2000/svg", 'svg'))
        // let flag = $("<svg/>", {style:"width:2rem", xmlns:"http://www.w3.org/2000/svg"})
        // .append($("<use/>", {"xlink:href":"images/flag.svg#flag", "style":`--color_fill: ${progress}`}))
        let flag = `${i}<svg style="width:2rem;"> 
        <use xlink:href="images/flag.svg#flag" style="--color_fill: ${progress};"></use>
        </svg>`
        let link = $("<a/>", {href: `javascript: loadSentence("${problem.sentence}")`}).append(flag)
        .on("mouseover", ((e) => (showProblem(e, problem))))
        $(menu).append([link, $("<tab/>")])
    })
}

// functions

// ready function
function loadSentence(bracketedSentence) {
    steps = 0
    par = getPar(bracketedSentence)
    positivePoint = 0
    sentence = bracketToString(bracketedSentence)
    getNumberOfRows(bracketedSentence)
    console.log(sentence)
    updatePoints()
    $("#problemConstituent, #lineContainer").html("")
    //foundation = $("#problemConstituent")
    // this causes problems with other functions that use foundation

    // foundation.append($("<div/>").append($("<div/>", {html:"TEST", class: "button"})))
    // setTimeout(x => dragula([document.querySelector('[data-row="0"]')], {copy:true}), 1000)


    // "check answer" button at top, click to generate bracketed syntax to compare and grade
    // if in this mode (manual checking vs automatic checking)
    // use config file?

    // $(foundation).append($("<div/>", { "data-row": 99, class: "container first-row" })) // start with just row 0 div
    let drake = dragula([...document.getElementsByClassName("container")], {
        isContainer: function (el) {
            console.log(el)
            console.log($(el).data("row"))
            // console.log($(el).hasClass("container"))
            if ($(el).data("row") == "0"){
                return false
            }
            if ($(el).hasClass("container")) {
                return true
            } else {
                return false
            }

        },
        moves: function (el, container, handle) {
            //console.log("move")
            return (handle.classList.contains('labelDiv') && !($(el).hasClass("traced")));
        },
        copy: true
    });
    // drake.on("out",resizeWindow)
    // drake.on("shadow",resizeWindow)
    drake.on("drop", (el, target, source, sibling) => {//resizeWindow()
        console.log(el, target, source, sibling)
        if (target === null) { // dropped back where it originated
            console.log("no movement")
            return
        }
        let destID = $(el).attr("id")
        console.log(destID)
        $(el).attr("id", Date.now()) // new distinct id
        let index = $(`[data-trace]`).length + 1
        $(`#${destID}`).attr("data-destination", index)
        $(el).attr("data-trace", index)
        $(el).data("trace", index)
        //console.log($(el).data("index"))
        //console.log($(el).prev().data("index"))
        // updating block index
        let newBlockIndex = $(el).data("index")
        if ($(el).prev().data("index")) {
            //console.log("prev exists")
            newBlockIndex = $(el).prev().data("index") + 1
        } else {
            //console.log("no prev")
            newBlockIndex = $(el).next().data("index")
        }
        //console.log(newBlockIndex)
        $(el).attr("data-index", newBlockIndex)
        $(el).data("index", newBlockIndex)
        //console.log($(el).data("index")) 
        //console.log(findParent($(el)))

        // test if this placement is valid for automatic mode
        if (mode == 'automatic') {
            let constituent = $(el).find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer) => { return wordContainer.innerHTML }).join(" ")
            let row = $(target).data("row")
            let trueRow = treeToRows(parse(bracketedSentence))[row]
            console.log({constituent, row})
            console.log({trueRow})
            ++steps
            if (trueRow.some(x => ((x.constituent === constituent)
                && (x.column === newBlockIndex || tracePad(trueRow, x.column, newBlockIndex))))) {
                updateIndicesAfterTrace(el)
                ++positivePoint
                $(el).addClass("traced")
                $(`#${destID}`).addClass("traced")
            } else {
                $(el).remove()
            }
            updatePoints()
            finishAlarm()
        }
        $(el).find(".labelDiv").text("?").css({ "cursor": "pointer" }).on({
            "click": generateMenu({bracketedSentences:"bracketedSentence"})
        })

        leftPad($(target))
        // drawLines() 
        resizeWindow()
        return true
    })
    makeSelectable(sentence, 0, 0, bracketedSentence) // this will allow highlighting/selecting, parsing through recursion
    $("#stage").on({
        mousedown: function (e) {
            // console.log($(e))
            const labelList = ["labelDiv", "labelItem", "labelMenu", "typeMenu", "typeItem"]
            $(".selected").removeClass("selected"); // clicking anywhere else deselects
            if (!labelList.some(el => $(e.target).hasClass(el))) { removeMenu() }
            // e.stopPropagation();
        }
    })
}

function makeSelectable(sentence, row, blockIndex, bracketedSentence) {
    // sentence is a string of words
    // row is the number of the div to put these words into
    // index is the position in the row, the initial index of the first word
    if (!($(`[data-row="${row}"]`)).length) {
        // create row div if it doesn't exist
        $(foundation).append($("<div/>", { "data-row": row, class: "container" }))

        //dragula(document.getElementsByTagName("div"), {copy:true, direction: 'horizontal', slideFactorX: 1, slideFactorY: 1})
        //dragula([...document.getElementsByClassName("container")], {});
    }

    let sentenceArray = [] // will fill with words from sentence then be converted to string
    sentence.split(' ').forEach((word, index) => {
        // console.log(blockIndex)
        let wordContainer = $("<div/>", { html: word, "data-uid": Math.random(), "data-index": index, class: "wordContainer" }).on({

            mousemove: function (e) {
                if (e.buttons == 1) {
                    selected(this)
                }
            },

            // for mobile compatibility

            "touching": function (e) {
                selected(this)
            },

            "touchmove": function (e) {
                let elem = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)
                $(elem).trigger("touching")
            }
        });
        sentenceArray.push(wordContainer); // at end of loop, will contain all words in current constituent
    })

    // put constituent block div in proper row div

    // get unique ID from timestamp
    let blockID = Date.now();

    let blockDiv = $("<div/>", { id: blockID, "data-index": blockIndex, class: "block" }).on({

        mousedown: function (e) {
            let clickedID = $(this).attr("id")

            let selectedJQ = $(`#${clickedID} .selected`)
            // console.log()

            // var tmp = $("<div/>");
            // tmp.html(selectedJQ);
            // console.log(tmp.html())
            // e.stopPropagation();
            if (selectedJQ.length) {
                let selectedWords = selectedJQ
                // selectedJQ.addClass("faded").removeClass("selected") // appear grey and can't be selected again
                // // once all words in a block are parsed they disappear
                // if(selectedJQ.parent().find(".faded").length == selectedJQ.parent().children().length) {
                //     selectedJQ.parent().addClass("hidden")
                // }

                blockIndex = $(`#${blockID}`).data("index") // in case it was updated

                let constituent = sentenceArrayToSentence(selectedWords)
                newIndex = blockIndex + parseInt(selectedWords[0].dataset.index)
                //console.log(constituent, blockIndex, newIndex)

                // check if constituent is valid before calling recursion
                // if in automatic checking mode
                if (mode == 'automatic') {

                    // parse and give steps if correct
                    let trueRow = treeToRows(parse(bracketedSentence))[row + 1]
                    let childRow = treeToRows(parse(bracketedSentence))[row + 2]
                    console.log(trueRow)
                    if (trueRow && trueRow.some(x => ((x.constituent === constituent)
                        && (x.column === newIndex || tracePad(trueRow, x.column, newIndex))))) {
                        makeSelectable(constituent, row + 1, newIndex, bracketedSentence);
                        selectedJQ.addClass("faded").removeClass("selected")
                        ++steps
                        ++positivePoint
                    } else {
                        let wrongArray = selectedJQ.toArray().map(item => $(item).data("uid")).join("")

                        if (!wrongAnswers.find((item) => item == wrongArray)) {
                            wrongAnswers.push(wrongArray)
                            console.log(treeToRows(parse(bracketedSentence))[row + 1])
                            ++steps
                        }
                        selectedJQ.addClass("animateWrong")
                        selectedJQ[0].addEventListener("animationend", (event) => {
                            selectedJQ.removeClass("animateWrong")
                            selectedJQ.removeClass("selected")
                        });

                    }
                    updatePoints()
                    //console.log(points)


                } else {
                    makeSelectable(constituent, row + 1, newIndex, bracketedSentence);
                    selectedJQ.addClass("faded").removeClass("selected") // appear grey and can't be selected again

                }

                // once all words in a block are parsed they disappear
                // if(selectedJQ.parent().find(".faded").length == selectedJQ.parent().children().length) {
                //     selectedJQ.parent().addClass("hidden")
                // }                    
                //resizeWindow()
                // redraw SVG based on new child
                // drawLines();
                resizeWindow()
            }
        }

    }).append([
        $("<div/>", { class: "labelDiv", html: "?" }).on({
            "click": generateMenu({bracketedSentences:"bracketedSentence"})
        }).css({ "cursor": "pointer" }),
        $("<div/>", { class: "constituentContainer" }).append(sentenceArray)])

    // dragula([...document.getElementsByClassName("container")], {
    //     moves: function (el, container, handle) {
    //         //console.log("move")
    //         return handle.classList.contains('labelDiv');
    //         }
    // });

    // testing drawing
    //drawDot(blockDiv)

    // actually put the constituent on the page
    // prepend to first div whose index is greater

    let rowJQ = $(`[data-row="${row}"]`)

    if (rowJQ.children().length) {
        let greatest = true
        rowJQ.children().each(function (item) {
            if (blockIndex < $(this)[0].dataset.index) {
                blockDiv.insertBefore($(this))
                greatest = false
                return false
            }
            if (greatest) {
                rowJQ.append(blockDiv)
            }
        })
    } else {
        rowJQ.append(blockDiv)
    }

    // console.log(rowJQ.children().first())
    // let firstItem = rowJQ.children().first()
    // let firstIndex = firstItem.data("index")
    // rowJQ.children().css({"padding-left":0})
    // firstItem.css({"padding-left":`${firstIndex * 10}rem`})

    //leftPad(rowJQ)
    leftPadAll()

}

function selected(el) {
    let thisBlockID = $(el).parent().parent().attr("id")
    let allSelected = $('.selected')
    if (allSelected.length) {
        let firstSelected = $(allSelected[0]).data("index")
        let lastSelected = $(allSelected.slice(-1)).data("index")
        for (i = firstSelected; i < lastSelected; i++) {
            $(allSelected[0]).parent().find("[data-index").each(function() {
                if ($(this).data("index") == i) { $(this).addClass("selected")}
            })
        }
        selectedID = $($(".selected")[0]).parent().parent().attr("id")
        if (thisBlockID != selectedID) {
            return
        }

    }
    if (!$(el).hasClass("faded")) {
        $(el).addClass("selected"); // highlights in turquoise
    }
}

function sentenceArrayToSentence(sentenceArray) {
    return $.makeArray(sentenceArray).map(wordDiv => wordDiv.innerHTML).join(" ");
}

function drawLines() {
    // resizeWindow()

    // clear current SVG
    $("#lineContainer").empty()

    // go through parent child pairs and draw all lines between them

    let callback = function (block) {
        let parent = findParent($(this))
        drawLine($(this), parent)
    }
    traverse(callback)

    // also draw arrows between traces and copies
    drawArrows()

}

function traverse(callback) {
    $(foundation).children().each(function (row) {
        let rowThis = $(this)
        let rowIndex = parseInt(rowThis.data("row"))
        if (rowIndex > 0) { // skip root node           
            rowThis.children().each(callback)
        }
    })
}

function findParent(block) {
    // row is row before row of block, look there for parent
    let parent = false
    rowIndex = parseInt(block.parent().data("row"))
    row = $(`[data-row="${rowIndex - 1}"]`)
    row.children().each(function () {
        // console.log($(this), $(this).data("index"))
        // console.log($(block), $(block).data("index"), $(block)[0].dataset.index)
        if ($(this).data("index") > $(block).data("index")) {
            return false
        }
        parent = $(this)
    })
    return parent
}

function drawLine(child, parent) {

    // takes jquery items

    //console.log({child, parent})

    // let containerWidth = $("#lineContainer").width()
    // let containerHeight = $("#lineContainer").height()

    [containerWidth, containerHeight] = getSize()

    let topElement = parent.find(".constituentContainer")

    let parentLabel = parent.find(".labelDiv")
    //console.log(parentLabel)
    // drawDot(parentLabel)
    // drawDot(parent)
    let childLabel = child.find(".labelDiv")

    let offset = 2
    let needsOffset = 0

    //console.log(parent.find(".constituentContainer").hasClass("hidden"))
    //console.log(parent.find(".constituentContainer").find(".wordContainer").first())

    if (parent.find(".constituentContainer").hasClass("hidden")) {
        topElement = parentLabel
        needsOffset = 1
    }


    // let [pleft, ptop, pright, pbottom] = getCorners(topElement)
    // //console.log({pleft, ptop, pright, pbottom})
    // let pCenterX = (pleft+pright) / 2
    // let pCenterXPercent = pCenterX / containerWidth * 100
    // let pbottomPercent = (pbottom + offset * needsOffset) / containerHeight * 100
    // // pbottomPercent += offset * needsOffset
    // // start of line will be (pCenterXPercent, pbottomPercent)

    // let [cleft, ctop, cright, cbottom] = getCorners(childLabel)
    // let cCenterX = (cleft+cright) / 2
    // let cCenterXPercent = cCenterX / containerWidth * 100
    // let ctopPercent = (ctop - offset) / containerHeight * 100
    // // ctopPercent -= offset
    // // end of line will be (cCenterXPercent, ctopPercent)

    let [, , , pbottomPercent, pCenterXPercent,] = getCornerPercentages(topElement)
    let [, ctopPercent, , , cCenterXPercent,] = getCornerPercentages(childLabel)
    console.log(pbottomPercent, pCenterXPercent, ctopPercent, cCenterXPercent)

    pbottomPercent = pbottomPercent + offset * needsOffset
    ctopPercent = ctopPercent - offset

    // x1 pCenterXPercent, y1 pbottomPercent, x2 cCenterXPercent, y2 ctopPercent
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    $("#lineContainer").append(line);
    $(line).attr({ x1: `${pCenterXPercent}%`, y1: `${pbottomPercent}%`, x2: `${cCenterXPercent}%`, y2: `${ctopPercent}%`, class: "branch" })


}

function drawDot(elem) {
    let containerWidth = $("#lineContainer").width()
    let containerHeight = $("#lineContainer").height()
    let [left, top, right, bottom] = getCorners(elem)
    //console.log({left, top, right, bottom})
    //console.log(left)
    let centerX = (left + right) / 2
    let centerY = (top + bottom) / 2
    let centerXPercent = centerX / containerWidth * 100
    let centerYPercent = centerY / containerHeight * 100

    let word = elem[0].innerHTML

    var shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape);
    $(shape).attr({ cx: `${centerXPercent}%`, cy: `${centerYPercent}%`, r: "1%", "data-word": word });

    // testing putting dots in upper left and bottom right
    let leftPercent = left / containerWidth * 100
    //console.log(leftPercent, left, containerWidth)
    let topPercent = top / containerHeight * 100
    var shape2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape2);
    $(shape2).attr({ cx: `${leftPercent}%`, cy: `${topPercent}%`, r: "1%", "data-word": word, fill: "green" });

    let rightPercent = right / containerWidth * 100
    let bottomPercent = bottom / containerHeight * 100
    var shape3 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape3);
    $(shape3).attr({ cx: `${rightPercent}%`, cy: `${bottomPercent}%`, r: "1%", "data-word": word, fill: "red" });

    // put dots where start and end of lines would be
    // x center, y bottom and x center, y top
    var shape4 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape4);
    $(shape4).attr({ cx: `${centerXPercent}%`, cy: `${bottomPercent}%`, r: "1%", "data-word": word, fill: "blue" });
    var shape5 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    $("#lineContainer").append(shape5);
    $(shape5).attr({ cx: `${centerXPercent}%`, cy: `${topPercent}%`, r: "1%", "data-word": word, fill: "yellow" });

    // center black, upper left green, bottom right red, bottom center blue, top center yellow


}

function getCorners(elem) {
    //console.log(elem)
    let width = elem[0].offsetWidth
    let height = elem[0].offsetHeight
    let top = elem.position().top
    let left = elem.position().left
    let right = left + width
    let bottom = top + height
    let centerX = (left + right) / 2
    let centerY = (top + bottom) / 2

    //return Object.values({left, top, right, bottom})
    console.log({ left, top, right, bottom, centerX, centerY })
    return [left, top, right, bottom, centerX, centerY]
}

function generateMenu(e, bracketedSentences) {
    // let clickedOnQuestion = $(e.target).hasClass("labelDiv")
    if ($(e.target).text() != "?") { return }
    // if(!clickedOnQuestion) {return}
    // if ($(e.target)){return false}
    if ($(".labelMenu").length) {
        return;
    }
    //console.log($(this))
    //console.log($(this).parent())
    // console.log($(this).parent().find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer)=>{return wordContainer.innerHTML}).join(" "))
    let constituent = $(this).parent().find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer) => { return wordContainer.innerHTML }).join(" ")
    //console.log(constituent)
    // console.log($(this).parent().parent().data("row"))
    let row = $(this).parent().parent().data("row")
    //console.log(row)
    // //console.log($(this).parent().data("index"))
    let column = $(this).parent().data("index")
    //console.log(column)

    // only used in auto mode
    let reference = treeToRows(parse(bracketedSentence))[row].find(item => item.constituent === constituent & item.column === column)
    let goldlabel = reference?.label
    //console.log(goldlabel)

    $(this).css({ "cursor": "auto", "width": "20rem" })

    let labels = ["N", "V", "P", "Adj", "Adv", "D", "C", "T", "S"]

    let typeMenu = $("<div/>", { class: "typeMenu" }).append(
        [$("<div/>", { class: "typeItem", html: "'" }), $("<div/>", { class: "typeItem", html: "P" })])

    let labelDivArray = []

    for (i of labels) {
        labelDivArray.push($("<div/>", { html: i, class: "labelItem" }))
    }

    $(this).append($("<div/>", { class: "labelMenu" }).append([...labelDivArray, typeMenu]))

    // drawLines()
    resizeWindow()

    let symbolMap = { "'": "bar", "P": "phrase" }

    $(this).find(".typeItem").on({
        "click": function (e) {
            let labelHTML = $(this).html()
            for (symbol of Object.keys(symbolMap)) {
                if (symbol != labelHTML) {
                    $(this).parent().parent().find(".labelItem").removeClass(symbolMap[symbol])
                }
            }
            $(this).parent().parent().find(".labelItem").toggleClass(symbolMap[labelHTML])

        }
    })

    $(".labelItem").on({
        "click": function (e) {
            let classes = new Set($(this).attr("class").split(" "))
            let types = new Set(Object.values(symbolMap))
            let intersect = [...classes].filter(i => types.has(i))[0] || ""
            let symbol = inverse(symbolMap)[intersect] || ""
            let label = $(this).html() + symbol
            // replace ? with label and close menu
            ++steps
            if ((mode == 'manual') || (mode == 'automatic' && label == goldlabel)) {
                removeMenu($(this).parent().parent(), label)
                ++positivePoint
            } else {
                $(this).parent().parent().addClass("animateWrong")
                $(this).parent().parent()[0].addEventListener("animationend", (event) => {
                    $(this).parent().parent().removeClass("animateWrong")
                    $(this).parent().parent().removeClass("selected")
                });
            }
            updatePoints()
            //console.log(points)


        }
    })

}

function removeMenu(labelItem = $(".labelDiv"), label = "?") {
    labelItem.css({ "width": "5rem" })
    if (label != "?"){labelItem.text(label)}
    $('.labelMenu').remove()
    // $(this).parent().remove() // cannot be reopened due to .one({}) // redundant?
    // $(this).parent().parent()
    // drawLines()
    resizeWindow()
    finishAlarm()
}

function inverse(obj) {
    var retobj = {};
    for (var key in obj) {
        retobj[obj[key]] = key;
    }
    return retobj;
}

function getTree() {
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
    let callback = function (block) {
        let childID = $(this).attr("id")
        let parent = findParent($(this))
        //console.log(parent)
        if (parent) {
            let parentID = findParent($(this)).attr("id")
            if (!(parentID in PCM)) {
                PCM[parentID] = []
            }
            PCM[parentID].push(childID)
        } else {
            //console.log("Error: parent does not exist")
        }

    }
    traverse(callback)

    return PCM
}

function treeAtNode(blockID, PCM) {
    let node = $(`#${blockID}`)
    let label = node.find(".labelDiv").text()

    // base case: child is not a parent and therefore is a leaf
    if (!(blockID in PCM)) {
        let word = node.find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer) => { return wordContainer.innerHTML }).join(" ")
        let leaf = `(${label} ${word})`
        //console.log(leaf)

        // if there's an attribute indicating that the word is a trace or destination, include ^ti or ^i
        //console.log(node.data("trace"), node.data("destination"))
        if (node.data("trace")) {
            leaf = leaf.replace(")", ` ^t${node.data("trace")})`)
        }
        // allow for multiple movements? 
        if (node.data("destination")) {
            leaf = leaf.replace(")", ` ^${node.data("destination")})`)
        }
        //console.log(leaf)

        return leaf
    } else {
        let childrenIDs = PCM[blockID]
        let children = ""
        childrenIDs.forEach((childID) => {
            children = `${children} ${treeAtNode(childID, PCM)}`
        })

        let tree = `(${label} ${children})`

        //console.log(tree)
        //console.log(node.data("trace"), node.data("destination"))

        if (node.data("trace")) {
            tree = tree.replace(/\)$/, ` ^t${node.data("trace")})`)
        }
        if (node.data("destination")) {
            tree = tree.replace(/\)$/, ` ^${node.data("destination")})`)
        }
        //console.log(tree)

        return tree
    }

}

function showProblem(event, problem) {
    console.log(event.clientY)
    $(menu).append($("<div/>", {id:"problemInfo", html:bracketToString(problem.sentence)}))
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

// function bracket to string was moved to separate file

function treeToRows(tree, accumulator = [], row = 0, leaves = []) {
    // try having index originate with leaves
    //console.log(leaves)
    //console.log(tree.trace, tree.index)

    accumulator[row] = accumulator[row] || []

    //base case
    //string child
    if (!Array.isArray(tree.children)) {
        let index = leaves.length
        leaves.push(tree.children)
        // accumulator[row].push({label:tree.label, constituent:tree.children, column:index})
        let newEntry = { label: tree.label, constituent: tree.children, column: index }
        if (typeof tree.trace !== 'undefined') {
            newEntry['trace'] = tree.trace
        }
        if (typeof tree.index !== 'undefined') {
            newEntry['destination'] = tree.index
        }
        accumulator[row].push(newEntry)
        return [tree.children, index]
    } else {
        let constituent = []
        let column = 0
        tree.children.forEach(function (child, i) {
            //console.log(child, i)
            let [word, index] = treeToRows(child, accumulator, row + 1, leaves)
            //console.log(word, index)
            //console.log(child.trace)
            if (typeof child.trace === 'undefined') { // don't include trace words
                //console.log("no trace")
                constituent.push(word)
            }
            // constituent.push(word)
            if (i == 0) { // constituent gets index of first word
                column = index
            }
        })
        // accumulator[row].push({label:tree.label, constituent:constituent.join(" "), column:column})
        let newEntry = { label: tree.label, constituent: constituent.join(" "), column: column }
        if (typeof tree.trace !== 'undefined') {
            newEntry['trace'] = tree.trace
        }
        if (typeof tree.index !== 'undefined') {
            newEntry['destination'] = tree.index
        }
        accumulator[row].push(newEntry)
        if (row == 0) {
            return accumulator
        } else {
            return [constituent.join(" "), column]
        }
    }

}

function getRows() {
    // makes row structure with labels and constituents from DOM
    let structure = []
    $(foundation).find("[data-row]").each(function (row) {
        structure[row] = []
        // //console.log(row)
        //console.log($(this))
        $(this).children().each(function (block) {
            // //console.log(block)
            //console.log($(this))
            let label = $(this).find(".labelDiv").text()
            //console.log(label)
            let constituent = $(this).find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer) => { return wordContainer.innerHTML }).join(" ")
            //console.log(constituent)
            // structure[row].push({label:label, constituent:constituent, column:$(this).data("index")})
            let newEntry = { label: label, constituent: constituent, column: $(this).data("index") }
            //console.log($(this).data("index"))
            //console.log($(this).data("destination"), $(this).data("trace"))
            if ($(this).data("trace")) {
                newEntry['trace'] = $(this).data("trace")
            }
            if ($(this).data("destination")) {
                newEntry['destination'] = $(this).data("destination")
            }
            structure[row].push(newEntry)
        })
    })
    return structure
}

function isValid(tree, subtree) {

    // //console.log(tree)
    // //console.log(subtree)
    let flag = true
    subtree.forEach(function (row, i) {
        row.forEach(function (c) {
            // check for matching constituent, label, column
            if (!(tree[i].some(x => ((x.constituent === c.constituent)
                & (c.label == "?" || x.label == c.label)
                & (x.column === c.column || tracePad(tree[i], x.column, c.column)))))) { // or column it could have before trace changes it
                flag = false
                // //console.log(false)
                // is there a way to break out of the loops?
                // keep track of where it went wrong to highlight
            }
            else {
                // //console.log(true)
            }

        })
    })
    return flag

}


function tracePad(row, xCol, cCol) {
    // x and c actually have equivalent columns if the element at c's column and all elements up to x
    // are traces
    console.log(xCol, cCol)
    console.log(row)
    // console.log(row.filter(n => n.column >= cCol && n.column < xCol))

    if (!row) {
        return // avoiding error
    }

    // split into variables
    // filterval
    // empty array should be false not true

    let filterval = row.filter(n => n.column >= cCol && n.column < xCol)
    console.log(filterval)
    if (!filterval.length) { // is this how you do it?
        console.log("empty")
        return false
    }
    return filterval.every(function (n) {
        // //console.log(typeof n.trace !== undefined)
        console.log(n.trace)
        // return (typeof n.trace !== undefined)
        return n.trace
    })

}

function isAncestor(node1, node2, pcm) {
    // takes jquery objects and map of parents to children
    // is node 1 an ancestor of node 2
    let id1 = node1.attr("id")
    let id2 = node2.attr("id")
    //console.log(id1, id2)
    if (id1 === id2) {
        return false
    } else if (!(id1 in pcm)) {
        // not ancestor of anything
        return false
    } else if (pcm[id1].includes(id2)) {
        // node 1 is parent of node 2
        return true
    } else {
        // recur
        return pcm[id1].some(x => isAncestor($(`#${x}`), node2, pcm))
    }
}

function updatePoints() {
    $("#points").html(`Par: ${par}<br/>Steps Used: ${steps}`)
}

function finishAlarm() {
    if (positivePoint == par) {
        if (steps == par) {
            //console.log("Correct!") 
            alert("Wonderful! You meet the par!")
        } else if (steps > par) {
            //console.log("On the right track!")
            alert("On the right track! But take too many steps!")
        }
        location.reload()
    }
}

function getNumberOfRows(bracketedSentence) {
    $(menu).data("currentNumberOfRows", treeToRows(parse(bracketedSentence)).length)
}

function leftPad(rowJQ) {
    //console.log(rowJQ.children().first())
    console.log(rowJQ)
    let firstItem = rowJQ.children().first()
    firstItem.addClass("first")
    let firstIndex = firstItem.data("index")
    rowJQ.css({ "padding-left": `${firstIndex * 10}rem` })

    rowJQ.children().css({ "padding-left": 0 })
    //rowJQ.prepend($("<img/>"))
    // firstItem.css({ "padding-left": `${firstIndex * 10}rem` })
    console.log(firstItem.css("padding-left"))

}

function leftPadAll() {
    $(foundation).children().each(function (rownum, rowval) {
        console.log(rownum, rowval)
        leftPad($(rowval))
    })
}

function findRowInPCM(id, pcm) {

    function findRowInPCM2(id, count = 0) {
        console.log(id)
        console.log(pcm)
        console.log(Object.keys(pcm))
        console.log(count, $(`#${id}`))
        //let count = 0
        // start from top? and count how many times it needs to recurse
        // or find parent and keep going until it reaches the top and count how many steps
        let parentID = Object.keys(pcm).filter(x => pcm[x].includes(id))[0]
        console.log(parentID)

        if (parentID === undefined) {
            console.log(count)
            return count
        }
        else {
            //return count + findRowInPCM(parentID, pcm, count+1)
            //count = count + findRowInPCM2(parentID, count+1)
            let nextStep = findRowInPCM2(parentID, count + 1)
            count += nextStep
            console.log(nextStep)
            console.log(count)
            return count
            // this gets too large
        }

    }
    return findRowInPCM2(id)

}
// delete?

function updateIndicesAfterTrace(trace) {
    let j = $(trace).data("index")
    $("[data-index].block").filter(function () {
        return $(this).data("index") >= j
    }).each((i, e) => {
        // update all except element itself and its ancestors
        if (!($(e).attr("id") === $(trace).attr("id") || isAncestor($(e), $(trace), getParentChildrenMap()))) {
            $(e).data("index", $(e).data("index") + 1)
            $(e).attr("data-index", $(e).data("index"))
        }
    })
}

function drawArrows() {
    // $("#lineContainer").empty()

    // console.log($(`[data-trace]`), $(`[data-destination]`))

    // recreate defs for arrows
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
    $("#lineContainer").append(defs)
    var marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
    $(defs).append(marker)
    $(marker).attr({
        id: "triangle", viewBox: "0 0 10 10", refX: "1", refY: "5",
        markerUnits: "strokeWidth", markerWidth: "5", markerHeight: "5", orient: "auto", href: "#triangle"
    })
    var triangle = document.createElementNS("http://www.w3.org/2000/svg", "path")
    $("#triangle").append(triangle)
    $(triangle).attr({ d: "M 0 0 L 10 5 L 0 10 z" })


    let [containerWidth, containerHeight] = getSize()

    // draw curves
    $(`[data-trace]`).each((i, block) => {
        console.log(i, block)
        console.log($(block).data("trace"))
        let endPoint = $(block).find(".constituentContainer")

        console.log($(`[data-destination=${$(block).data("trace")}]`))
        let startPoint = $(`[data-destination=${$(block).data("trace")}]`).find(".constituentContainer")

        // drawDot(endPoint)
        // drawDot(startPoint)

        console.log(endPoint)
        console.log(startPoint)

        // end point includes padding which is a problem
        // note: endpoint and startpoint are mixed up?
        // use constituentContainer instead? yes




        // how to find control point(s)? 
        // calculate point coordinates
        let [, , , endbottom, endCenterX,] = getCorners(endPoint)
        let [, , , startbottom, startCenterX,] = getCorners(startPoint)
        // console.log(endCenterX, endbottom)
        // console.log(startCenterX, startbottom)

        let [, , , endbottomPercent, endCenterXPercent,] = getCornerPercentages(endPoint)
        let [, , , startbottomPercent, startCenterXPercent,] = getCornerPercentages(startPoint)

        // draw curves using those endpoints
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        $("#lineContainer").append(path);
        // calculate control point
        // same y as lowest + fudge factor
        let controlY = Math.max(endbottom, startbottom) + 20
        // let controlYPercent = Math.max(endbottomPercent, startbottomPercent) + 4
        // x is average of both - fudge factor
        let controlX = ((endCenterX + startCenterX) / 2) - 50
        // let controlXPercent = ((endCenterXPercent + startCenterXPercent) / 2) - 10

        $(path).attr({
            d: `M ${endCenterX} ${endbottom} Q ${controlX} ${controlY} ${startCenterX} ${startbottom}`,
            class: "arrow", fill: "transparent", "marker-end": "url(#triangle)"
        })

        // $(path).attr({d:`M ${endCenterXPercent}% ${endbottomPercent}% Q ${controlXPercent}% ${controlYPercent}% ${startCenterXPercent}% ${startbottomPercent}%`, 
        // class:"arrow", fill:"transparent", "marker-end":"url(#triangle)"})
        // actually can't use percentages oops
        // get arrows to scale with resize
        // why don't they do this anyway


    })
}


function getSize() {
    return [$("#lineContainer").width(), $("#lineContainer").height()]
}

function getCornerPercentages(elem) {
    let [left, top, right, bottom] = getCorners(elem)
    console.log(left, top, right, bottom)
    let [containerWidth, containerHeight] = getSize()
    console.log(containerWidth, containerHeight)
    let leftPercent = left / containerWidth * 100
    let rightPercent = right / containerWidth * 100
    let topPercent = top / containerHeight * 100
    let bottomPercent = bottom / containerHeight * 100
    //return Object.values({leftPercent, topPercent, rightPercent, bottomPercent})

    let centerXPercent = (leftPercent + rightPercent) / 2
    let centerYPercent = (topPercent + bottomPercent) / 2
    console.log(leftPercent, topPercent, rightPercent, bottomPercent, centerXPercent, centerYPercent)
    return [leftPercent, topPercent, rightPercent, bottomPercent, centerXPercent, centerYPercent]

    // replace calculations in drawLine with this
}

function getPar(bracketedSentence){
    let str = bracketedSentence
    let par = 0
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) == "("){
            par++
        }
      }
    par = par *2 -1;
    return par
}