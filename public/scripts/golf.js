let globals = {"problemJSON":null}
//let sentence = "Mary had a little lamb" // default sentence but can be replaced by input
$(document).ready(init)

function init() {

    if (window.location.href.includes("localhost")){
        fetch(`/set_NetID?netID=liu36`)
    }

    let problem_id = parseQuery(window.location.search).problem_id || 7
    
JSON_API(undefined, problem_id)
        .then((data) => {
            // console.log({data})
            globals.problemJSON = data
            let problemJSON = globals.problemJSON;
            let startingSentence = parseQuery(window.location.search).string 
            // || "(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))"
            //let sentence = treeToString(parse(bracketedSentence))
            if (startingSentence) {
                problemJSON.holes[0].expression = startingSentence
                problemJSON.holes = [problemJSON.holes[0]]
                problemJSON.description = "tests"
            }
           // sendJSON(problemJSON, 1)
            loadMenu()
            loadSentence(0)
            intro()
        })
}

function loadMenu() {
    let problemJSON = globals.problemJSON;
    mode = parseQuery(window.location.search).mode || 'automatic'
    if (mode == 'manual') {
        $("#menu").append($("<div/>", { html: "Check Answer", class: "button" }).on({
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
        $("#menu").append($("<div/>", { id: "points" }))
    }
    problemJSON.holes.forEach((problem, i) => {
        let minStep = getMinStep(problem.expression)
        let parFactor = getParFactor(minStep)
        let par = parseInt(minStep+parFactor)
        let {flagColor, alarm} = getProgressSignal(bestProgress(problem.progress), par, minStep)
        // let flag = $(document.createElementNS("http://www.w3.org/2000/svg", 'svg'))
        // let flag = $("<svg/>", {style:"width:2rem", xmlns:"http://www.w3.org/2000/svg"})
        // .append($("<use/>", {"xlink:href":"images/flag.svg#flag", "style":`--color_fill: ${progress}`}))
        let flag = `<div class=problemList> 
        <svg style="width:3rem;" viewBox="0 0 208 334">
        <use xlink:href="images/flag.svg#flag" id="${i}" style="--color_fill: ${flagColor};"></use>
        </svg>
        <div style="font-size:1em">hole ${i + 1} <br/> Par: ${par}</div>
        </div>`
        let link = $("<a/>", { class: "hole", href: `javascript: loadSentence(${i})` }).append(flag)
            .on("mouseover", ((e) => (showProblem(e, problem)))).on("mouseout", (() => ($("#problemInfo").remove())))
        $("#menu").append([link])
        // if (flagColor == "white") {$(`#${i}`).parent().parent().parent().addClass("disable")}
    })
    let button = `<img src="images/questionmark.svg" alt="Tour" id="tourButton"></img>`
    $(stage).append(button)
    // let numberOfTryHoles = problemJSON.holes.length() - $(".disable").length();
    // enableNext();
}

// functions
function enableNext() {
    $(".disable").first().removeClass("disable")
}
// ready function
function loadSentence(sentenceID) {
    document.querySelector("#dialog")?.remove();
    let problemJSON = globals.problemJSON;
    let bracketedSentence = problemJSON.holes[sentenceID].expression
    if (bracketedSentence) {
        bracketedSentence = bracketedSentence.replaceAll("[", "(").replaceAll("]", ")");
        bracketedSentence = bracketedSentence.replace(/[\r\n]/g, '').replace(/  +/g, ' ');
        bracketedSentence = bracketedSentence.replaceAll(")(", ") (");
        bracketedSentence = bracketedSentence.replaceAll("(det ", "(Det ");
        }
    $("#sentenceContainer").attr("data-currentSentenceID", sentenceID)
    $("#sentenceContainer").attr("data-bracketedSentence", bracketedSentence)
    $("#problemConstituent").attr("data-stepsUsed", 0)
    let minStep = getMinStep(bracketedSentence)
    let parFactor = getParFactor(minStep)
    $("#problemConstituent").attr("data-positivePoint", 0)
    let sentence = bracketToString(bracketedSentence)
    getNumberOfRows()
    // console.log(sentence)
    updatePoints()
    $("#problemConstituent, #lineContainer").html("")
    resizeWindow()
    //foundation = $("#problemConstituent")
    // this causes problems with other functions that use foundation

    // foundation.append($("<div/>").append($("<div/>", {html:"TEST", class: "button"})))
    // setTimeout(x => dragula([document.querySelector('[data-row="0"]')], {copy:true}), 1000)


    // "check answer" button at top, click to generate bracketed syntax to compare and grade
    // if in this mode (manual checking vs automatic checking)
    // use config file?

    // $(foundation).append($("<div/>", { "data-row": 99, class: "container first-row" })) // start with just row 0 div
    // syntax mode or morphology mode
    let selectedMode = undefined;
    if (bracketedSentence.startsWith(("(N ") || ("(V ") || ("(P ") || ("(Adj ") || ("(Adv "))) {
        selectedMode = "morphology";
    }
    makeSelectable(sentence, 0, 0, selectedMode) // this will allow highlighting/selecting, parsing through recursion
    $("#stage").on({
        mousedown: function (e) {
            // console.log($(e))
            const labelList = ["labelDiv", "labelItem", "labelMenu", "typeMenu", "typeItem"]
            $(".selected").removeClass("selected"); // clicking anywhere else deselects
            if (!labelList.some(el => $(e.target).hasClass(el))) { removeMenu() }
            document.querySelector("#dialog")?.remove();
            // e.stopPropagation();
            // if ($("#tenseSelect").length){
            //     document.getElementById("tenseSelect").addEventListener('change', ()=>{
            //         ++stepsUsed
            //         constituent = ("-").concat(document.getElementById("tenseSelect").value)
            //         console.log(constituent)
        
            //     }); 
            // } //event listener for change event on created selection box for tense
        }
    })
    setUpDrake();
    // document.getElementsByClassName("wordContainer")[0].focus()
}

function intro() {
    let problemJSON = globals.problemJSON;
    var intro = introJs();
    let dragVideo= "<video src='images/dragVideo.mp4'  autoplay class='introVideo' />"
    let parseVideo= "<video src='images/parseVideo.mp4'  autoplay class='introVideo' />"
    let labelInput = "<video src='images/labelInput.mp4'  autoplay class='introVideo' />"
    intro.setOptions({
        steps: [{
            intro: problemJSON.description || "Here is your instructions"
        }, {
            element: document.querySelector('#menu'),
            intro: "You choose different hole and see progress by looking at the color of flag, with white for incomplete, red for do it again, green for finished but could be better, and blue for wonderful",
            position: 'right'
        }, {
            element: document.querySelector('#points'),
            intro: "You will see your progress of each question here. Par means how many steps a good grade will take, but you need to take below the Par to get 100% for each question. Steps refer to how many steps you already took.",
            position: 'left'
        }, {
            element: document.querySelector('#problemConstituent'),
            intro: "You will create Syntax tree here",
            position: 'left'
        }, {
            element: '#row_id_0',
            intro: `You will parse from here. <hr/> ${parseVideo}`,
            position: 'left'
        }, {
            element: '#label_row_0',
            intro: `You will choose part of the sentence that this line belong to. <hr/> ${labelInput}`,
            position: 'left'
        }, {
            intro: `You can drag words around the tree by moving the label. For moving to the front of a word, called B, you drag the word that you want to change space, called A, to cover B. For moving to the back of a word, called B, you drag the word that you want to change space, called A, to the right of B. <hr/> ${dragVideo}`
        }, {
            element: '#tourButton',
            intro: 'This button can be clicked to view this tour again at any time. You can click anywhere outside thie popup to begin.',
            position:'bottom'
          }]
    })
    intro.oncomplete(function() {
        localStorage.setItem('doneTour', 'yeah!');
      })
    window.addEventListener('load', ()=> {
        var doneTour = localStorage.getItem('doneTour') === 'yeah!';
        if (doneTour) {return console.log("finish")};
        intro.start();
    })
    $("#tourButton").click(function(){
        intro.start();
      });
}

function getTraceInfo(el, source){
    let row = $(source).attr("data-row")
    if (isNaN($(el).attr("data-blockindex"))) {
        $(el).attr("data-blockindex", $(el).next().attr("data-blockindex"))
    }
    let index = $(el).attr("data-blockindex")
    let bracketedSentence = $("#sentenceContainer").attr("data-bracketedSentence")
    let rows = treeToRows(parse(bracketedSentence)) 
    // console.log(row,index, rows)
    let moveThing = rows[row].find(x => x.column == index)
    return moveThing
}

function makeSelectable(sentence, row, blockIndex, selectionMode=undefined, wrongAnswers = [], different ="") {
    let bracketedSentence = $("#sentenceContainer").attr("data-bracketedSentence")
    let mode = parseQuery(window.location.search).mode || 'automatic'
    console.log(sentence, row, blockIndex, bracketedSentence, selectionMode, wrongAnswers, different)
    // sentence is a string of words
    // row is the number of the div to put these words into
    // console.log(bracketedSentence, parse(bracketedSentence))
    // index is the position in the row, the initial index of the first word
    console.log(parse(bracketedSentence))
    console.log(treeToString(parse(bracketedSentence)))
    console.log(treeToRows(parse(bracketedSentence)))
    if (!($(`[data-row="${row}"]`)).length) {
        // create row div if it doesn't exist
        let thisRow = treeToRows(parse(bracketedSentence))[row]
        // console.log(thisRow.length, thisRow)
        // let gridColumnStyle = `grid-template-columns: repeat(${thisRow.length}, 1fr);`

        let columnLength = totalColumn(treeToRows(parse(bracketedSentence)))
        let gridColumnStyle = `grid-template-columns: repeat(${columnLength}, 1fr);`
        if (thisRow.length == 1) {
            gridColumnStyle = ""
        }
        $("#problemConstituent").append($("<div/>", { "data-row": row, class: "container", style:gridColumnStyle }))

        //dragula(document.getElementsByTagName("div"), {copy:true, direction: 'horizontal', slideFactorX: 1, slideFactorY: 1})
        //dragula([...document.getElementsByClassName("container")], {})
    }

    let nextRow = treeToRows(parse(bracketedSentence))[row + 1] || []
    let filterRow = nextRow.filter(n => n.column >= blockIndex && n.column < (blockIndex + sentence.split(" ").length))
    // console.log(blockIndex, filterRow, nextRow, blockIndex + sentence.split(" ").length)
    let modeChange = false
    filterRow.forEach(x => {
        if (x.label == "Af") {
            modeChange = true
        }
        // console.log(x, x.label)
    })
    if (modeChange) {
        selectionMode = "morphology"
        // $(this).attr("data-selectionMode", selectionMode)
    }

    let sentenceArray = [] // will fill with words from sentence then be converted to string
    let traceIndexOffset = 0;
    let af = true
    if (different == "&") {
        af = false
    }
    sentence.split(' ').forEach((word, index) => {
        let noPad =""
        let fudge = 0
        // if (word == "see")  {
        //     fudge=2
        // }
        // console.log(word)
        if ($("#sentenceContainer").attr("data-changedword")) {
            let numberOfRows = $("#menu").attr("data-currentNumberOfRows");
            let changedWord = $("#sentenceContainer").attr("data-changedword")
            changedWord.split(",").forEach(x => {if (x.includes(word)) {changedWord = x}})
            let changedWordSet = changedWord.trim().split("#");
            let changedWordCount = changedWordSet.length;
            // console.log(changedWordCount, changedWordSet)
            let changedWordIndex = Math.abs(Math.max(changedWordCount-(numberOfRows-row), 0));
            if (changedWordSet.includes(word)|| word == changedWord ) {
                sentence = sentence.replace(` ${word} `, ` ${changedWordSet[changedWordIndex]} `)
                word = changedWordSet[changedWordIndex]
                // console.log(word, sentence, changedWordIndex, changedWordSet)
            }}
        if (word == "") {
            traceIndexOffset -=1;
            return
        }
        if (word.startsWith(`'`) || ($("#sentenceContainer").attr("data-morphologyparts") && $("#sentenceContainer").attr("data-morphologyparts").includes(word)))
            {
                noPad = "noPad"
            }
        if (selectionMode == "morphology") {
            noPad = "noPad"
            word.split('').forEach((letter) => {
                if (letter == "*") {
                    noPad = ""
                    index += 1
                    return
                }
                sentenceArray = containerSetUpAndInput(letter, index, traceIndexOffset, fudge, `letterContainer ${noPad}`, sentenceArray)
                noPad = "noPad"
            })
        } else {
            sentenceArray = containerSetUpAndInput(word, index, traceIndexOffset, fudge, `wordContainer ${noPad}`, sentenceArray)}
    })
    let blockElement = [
        (af ? $("<div/>", { class: "labelDiv", id: `label_row_${row}`, html: "?" }).on({
            "click": generateMenu,
        }).css({ "cursor": "pointer" }): $("<div/>", { class: "labelDiv morphoHide"})),
        $("<div/>", { class: "constituentContainer", id:`row_id_${row}` }).append(sentenceArray)]

    // if (different == "auxItem") {
    //     blockElement = [$("<div/>", { class: "labelDiv", id: `label_row_${row}`, html: "?" }).on({
    //         "click": generateMenu}).css({ "cursor": "pointer" })]
    //         tenseSelection(blockElement)
    //         console.log(blockElement)
    //     } //create selection box for tense
    // put constituent block div in proper row div
    
    // get unique ID from timestamp
    let blockID = Date.now();
    let blockDiv = $("<div/>", { id: blockID, "data-blockindex": blockIndex, "data-selectionMode": selectionMode, class: `block`
        , style:`grid-column:${blockIndex+1} `
        // , style:`grid-column:${blockIndex-row+2} `
        }).on({
        // mousemove: function (e) {
        //     console.log($(this).prev().attr("data-blockindex"), $(this).prev(), $(this))
        //     if ($(this).prev().attr("data-blockindex") == $(this).attr("data-blockindex")){
        //         let newBlockIndex = parseInt($(this).prev().attr("data-blockindex"))+1
        //         $(this).attr("data-blockindex", newBlockIndex)
        //     }
        //     if ($(this).attr("data-blockindex") && !($(this).attr("style").includes(`grid-column: ${parseInt($(this).attr("data-blockindex"))+1}`))) {
        //         $(this).attr("style", `grid-column: ${parseInt($(this).attr("data-blockindex"))+1}`)
        //     }
        // },
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
                let trueRow = treeToRows(parse(bracketedSentence))[row + 1]
                let thisRow = treeToRows(parse(bracketedSentence))[row]
                let treeRow = treeToRows(parse(bracketedSentence))
                // console.log(selectedWords, selectionMode, sentence)
                blockIndex = $(`#${blockID}`).attr("data-blockindex") // in case it was updated
                // console.log(selectedJQ, $(`#${blockID}`), selectedWords[0])
                if ($("#sentenceContainer").attr("data-changedword")) {
                    thisRow.some(x => {if (x.changed === sentence) {
                        sentence = x.constituent
                    }})
                }
                let constituent = sentenceArrayToSentence(selectedWords, selectionMode, sentence)
                newIndex = parseInt(blockIndex) + parseInt(selectedWords[0].dataset.index)
                // console.log(constituent, blockIndex, newIndex, selectedWords)

                // check if constituent is valid before calling recursion
                // if in automatic checking mode
                if (mode == 'automatic') {
                    let xlabel = ""
                    // parse and give steps if correct
                    console.log(trueRow, newIndex, constituent, treeRow)
                    // console.log(trueRow.some(x => ((x.constituent === constituent))), constituent)
                    // x.constituent === constituent
                    let match = trueRow && trueRow.some(x => {if ((x.constituent === constituent || (x.changed === constituent))&&
                            (x.column === newIndex + (tracePad(row+1, x.column, newIndex, treeRow)))){
                            // console.log($(this).children()[1])
                            xlabel = x.label
                            // $(this).children()[1].attr("data-nextElLabel", x.label)
                            return true
                         } else {return false}})
                    // console.log(match)
                    if (match
                            //   || x.column === newIndex
                            //   || tracePad(trueRow, x.column, newIndex)
                            ) {
                        makeSelectable(constituent, row + 1, newIndex, selectionMode, wrongAnswers, xlabel);
                        selectedJQ.addClass("faded").removeClass("selected")
                        $("#problemConstituent").attr("data-stepsUsed", parseInt($("#problemConstituent").attr("data-stepsUsed"))+1)
                        $("#problemConstituent").attr("data-positivePoint", parseInt($("#problemConstituent").attr("data-positivePoint"))+1)
                    } else {
                        let wrongArray = selectedJQ.toArray().map(item => $(item).attr("data-uid")).join("")

                        if (!wrongAnswers.find((item) => item == wrongArray)) {
                            wrongAnswers.push(wrongArray)
                            // console.log(treeToRows(parse(bracketedSentence))[row + 1])
                            $("#problemConstituent").attr("data-stepsUsed", parseInt($("#problemConstituent").attr("data-stepsUsed"))+1)
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
                    makeSelectable(constituent, row + 1, newIndex, selectionMode, wrongAnswers);
                    selectedJQ.addClass("faded").removeClass("selected") // appear grey and can't be selected again

                }

                // once all words in a block are parsed they disappear
                // if(selectedJQ.parent().find(".faded").length == selectedJQ.parent().children().length) {
                //     selectedJQ.parent().addClass("hidden")
                // }                    
                //resizeWindow()
                // redraw SVG based on new child
                // drawLines();
                // $("div:contains('s)").css({"padding-left":0})
                resizeWindow()
            }
        }

    }).append(blockElement)

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
            if (blockIndex < $(this)[0].dataset.blockindex) {
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
    // let firstIndex = firstItem.attr("data-index")
    // rowJQ.children().css({"padding-left":0})
    // firstItem.css({"padding-left":`${firstIndex * 10}rem`})

    //leftPad(rowJQ)
    // leftPadAll()
    // console.log($(".noPad").prev().html())
    $(".noPad").prev().css({"padding-right":0})
}

function totalColumn(nodeSentence) {
    let totalColumn = 0
    nodeSentence.forEach(x=> {
        x.forEach(y => {
            if (y.column > totalColumn) {
                totalColumn = y.column
                console.log(totalColumn)
            }
        })
    })
    return totalColumn +1;
}

function selected(el) {
    let thisBlockID = $(el).parent().parent().attr("id")
    let allSelected = $('.selected')
    if (allSelected.length) {
        let firstSelected = $(allSelected[0]).attr("data-index")
        let lastSelected = $(allSelected.slice(-1)).attr("data-index")
        for (i = firstSelected; i < lastSelected; i++) {
            $(allSelected[0]).parent().find("[data-index").each(function () {
                if ($(this).attr("data-index") == i) { $(this).addClass("selected") }
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

function sentenceArrayToSentence(sentenceArray, selectionMode, sentence) {
    if (selectionMode == "morphology") {
        let selectedWord = $.makeArray(sentenceArray).map(wordDiv => wordDiv.innerHTML).join("");
        let comparedWord = []
        sentence.split(" ").forEach((word) => {
            // console.log(sentenceArray, sentence, word, selectedWord)
            if (word == selectedWord.substr(0, word.length)) {
                comparedWord.push(word)
                selectedWord = selectedWord.substr(word.length)
                // console.log(selectedWord)
            }
        })
        comparedWord.push(selectedWord)
        // console.log(comparedWord, comparedWord.join(" "), sentenceArray, selectedWord)
        return comparedWord.join(" ").replace(/ $/g, '');
    }
    return $.makeArray(sentenceArray).map(wordDiv => wordDiv.innerHTML).join(" ");
}

function containerSetUpAndInput(text, index, traceIndexOffset, fudge, className, sentenceArray) {
    if (text.includes("-")) {
        return sentenceArray
    }
    // console.log(text, index,traceIndexOffset, fudge, className, sentenceArray)
    let container =  $("<div/>", { role:"checkbox","aria-checked":"false",html: text, "data-uid": Math.random(), "data-index": index+traceIndexOffset+fudge, class: className })
                .on({
        
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
                sentenceArray.push(container)
    return sentenceArray;
}

function labelEmptyGridColumns(gridContainer) {
    const gridChildren = Array.from(gridContainer.children);
    console.log(gridContainer, gridChildren)
    // Determine the maximum grid-column value
    const columnValues = gridChildren.map(child => 
        parseInt(getComputedStyle(child).gridColumnStart, 10)
    );
    const maxColumn = Math.max(...columnValues);

    // Loop through each column in the grid
    for (let i = 1; i <= maxColumn; i++) {
        const isEmpty = !gridChildren.some(child => 
            parseInt(getComputedStyle(child).gridColumnStart, 10) === i
        );

        if (isEmpty) {
            // Add a label or marker for empty columns
            const label = document.createElement('div');
            label.className = 'empty-column-label';
            label.style.gridColumn = i;
            gridContainer.appendChild(label);
        }
    }
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
    $("#problemConstituent").children().each(function (row) {
        let rowThis = $(this)
        let rowIndex = parseInt(rowThis.attr("data-row"))
        if (rowIndex > 0) { // skip root node           
            rowThis.children().each(callback)
        }
    })
}

function setUpDrake() {
    let drake
    let mode = parseQuery(window.location.search).mode || 'automatic'
    if (drake) {drake.destroy();}
    drake = dragula([...document.getElementsByClassName("container")], {
        isContainer: function (el) {
            // console.log(el)
            // console.log($(el).attr("data-row"))
            // console.log($(el).hasClass("container"))
            if ($(el).attr("data-row") == "0") {
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
    drake.on("drag", (el, source)=> {
        console.log(el, el.id)
        if (getTraceInfo(el, source).destination) {
            let destNum = getTraceInfo(el, source).destination
            $(el).attr("data-dest", parseInt(destNum))
            // console.log($(el).attr("data-dest"))
        }
        let targetRow = parseInt($("#problemConstituent").attr("data-targetRow"))
        let target = document.querySelectorAll(`[data-row='${targetRow}']`)[0]
        console.log(target)
        if (target) {labelEmptyGridColumns(target)}
    })
    drake.on("drop", (el, target, source, sibling) => {//resizeWindow()
        // console.log({el, target, source, sibling})
        // $(".gu-mirror").remove()
        if (target === null) { // dropped back where it originated
            // console.log("no movement")
            return
        }
        let destID = $(el).attr("id")
        console.log(destID)
        $(el).attr("id", Date.now()) // new distinct id
        let index = $(`[data-wastraced]`).length + 1
        $(`#${destID}`).attr("data-destination", index)
        $(el).attr("data-wastraced", index)
        //console.log($(el).prev().attr("data-blockindex"))
        // updating block index
        let newBlockIndex = $(el).attr("data-blockindex")
        console.log($(el).next(), $(el).prev())
        let nextDetector;
        if ($(el).next()[0] == undefined) {nextDetector = false} else {nextDetector = $(el).next()[0].className == "empty-column-label"}
        if (nextDetector) {
            console.log("empty space")
            $(el).remove()
            $('.empty-column-label').remove()
            requestAnimationFrame(()=> {resizeWindow()})
            return true
        } else {
        $('.empty-column-label').remove()
        if ($(el).prev()) {
            console.log('prev exist');
            newBlockIndex = parseInt($(el).prev().attr("data-blockindex")) + 1
        } else {
            console.log("no prev")
            newBlockIndex = parseInt($(el).next().attr("data-blockindex"))
        }
        // console.log(newBlockIndex, $(el))
        $(el).attr("data-blockindex", newBlockIndex)
        // console.log($(el).attr("data-blockindex")) 
        //console.log(findParent($(el)))
        if (getTraceInfo(el, target)?.trace) {
            let traceNum = getTraceInfo(el, target).trace
            $(el).attr("data-traceIndex", parseInt(traceNum))
            // console.log($(el))
        }
        let traceInfo = getTraceInfo(el, target)
        // console.log(getTraceInfo(el, target))

        // test if this placement is valid for automatic mode
        if (mode == 'automatic') {
            newBlockIndex = parseInt($(el).attr("data-blockindex")) //update blockIndex
            let trace = $(el).attr("data-traceIndex");
            let dest =  $(`#${destID}`).attr("data-dest");
            $("#problemConstituent").attr("data-stepsUsed", parseInt($("#problemConstituent").attr("data-stepsUsed"))+1)
            console.log(trace, dest)
            // console.log(treeToRows(parse(bracketedSentence)))
            // trueRow.some(x => ((x.constituent === constituent)
            // && (x.column === newBlockIndex || tracePad(trueRow, x.column, newBlockIndex))
            // && 
            if (trace && (trace == dest)) {
                $(el).attr("style", `grid-column: ${newBlockIndex+1}`)
                $(el).next().attr("style", `grid-column: ${newBlockIndex+2}`)
                updateIndicesAfterTrace(el)
                $("#problemConstituent").attr("data-positivePoint", parseInt($("#problemConstituent").attr("data-positivePoint"))+1)
                if (!(traceInfo.destination)){
                    $(el).addClass("traced")
                }
                $(`#${destID}`).addClass("traced")
                // console.log($(`#${destID}`),$(el)[0],traceInfo)
            } else {
                $(el).remove()
            }
            updatePoints()
            // finishAlarm()
        }
        $(el).find(".labelDiv").text("?").css({ "cursor": "pointer" }).on({
            "click": generateMenu
        })

        // leftPad($(target))
        // drawLines() \
        requestAnimationFrame(()=> {resizeWindow()}) //wait until previous program finished
        // setTimeout(x=> {resizeWindow()}, 1000) 
        return true }
    })
}

function findParent(block) {
    // row is row before row of block, look there for parent
    let parent = false
    rowIndex = parseInt(block.parent().attr("data-row"))
    row = $(`[data-row="${rowIndex - 1}"]`)
    // console.log(row)
    indexVarificator = parseInt($(block).attr("data-blockindex"))
    row.children().each(function () {
        // console.log($(this), $(this).attr("data-blockindex"))
        // console.log($(block), $(block).attr("data-blockindex"), $(block)[0].dataset.blockindex)
        // console.log($(this))
        if ($(this).attr("data-traceindex") && $(block).attr("data-wastraced")) {
            indexVarificator -= 1
        }
        if ($(this).attr("data-blockindex") > indexVarificator) {
            return false
        }
        parent = $(this)
    })
    // console.log(parent, block, indexVarificator)
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

    let offset = .5
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
    // console.log(pbottomPercent, pCenterXPercent, ctopPercent, cCenterXPercent)

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
    // console.log(elem)
    let width = elem[0].offsetWidth
    let height = elem[0].offsetHeight
    let top = elem.position().top
    let left = elem.position().left
    let right = left + width
    let bottom = top + height
    let centerX = (left + right) / 2
    let centerY = (top + bottom) / 2

    //return Object.values({left, top, right, bottom})
    // console.log(elem, { left, top, right, bottom, centerX, centerY })
    return [left, top, right, bottom, centerX, centerY]
}

function generateMenu(e) {
    let mode = parseQuery(window.location.search).mode || 'automatic'
    let bracketedSentence = $("#sentenceContainer").attr("data-bracketedSentence")
    // let clickedOnQuestion = $(e.target).hasClass("labelDiv")
    if ($(e.target).text() != "?") { return }
    // if(!clickedOnQuestion) {return}
    // if ($(e.target)){return false}
    if ($(".labelMenu").length) {
        return;
    }
    // console.log($(this))
    // console.log($(this).parent())
    // console.log($(this).parent().find(".constituentContainer").find(".letterContainer"))
    // console.log($(this).parent().find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer)=>{return wordContainer.innerHTML}).join(" "))
    let constituent = $(this).parent().find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer) => { return wordContainer.innerHTML }).join(" ")
    //console.log(constituent)
    // console.log($(this).parent().parent().attr("data-row"))
    let row = parseInt($(this).parent().parent().attr("data-row"))
    // console.log($(this).parent().parent())
    // //console.log($(this).parent().attr("data-blockindex"))
    let column = parseInt($(this).parent().attr("data-blockindex"))
    let treeRow = treeToRows(parse(bracketedSentence))
    // let filterForTense = treeRow[row].find(item => item.constituent.includes("-"))
    // // if (filterForTense) {
    // //     filterForTense.constituent = filterForTense.constituent.replace(/ -(\w+)/g, "")
    // //     console.log(filterForTense)
    // // }
    let reference = treeRow[row].find(item => item.constituent.replace(/\s/g, '') === constituent.replace(/\s/g, '') && item.column === column + (tracePad(row+1, item.column, column, treeRow)))
    if ($(this).parent().find(".constituentContainer").find(".letterContainer").length) {
        constituent = $(this).parent().find(".constituentContainer").find(".letterContainer").toArray().map((letterContainer) => { return letterContainer.innerHTML }).join("")
        reference = treeRow[row].find(item => (item.constituent.replace(/\s/g, '') === constituent || item.changed === constituent) && item.column === column + (tracePad(row+1, item.column, column, treeRow)))
        console.log(reference, treeRow, constituent)
    }
        // only used in auto mode
    //+ (tracePad(row, item.column, column, treeRow))
    // item.constituent === constituent & 
    let correctLabel = reference?.label
    console.log(reference, correctLabel, constituent, column, treeRow[row])

    $(this).css({ "cursor": "auto"})
    let labelArrayID = 1;
    if (bracketedSentence.includes("(Aux ")) {
        labelArrayID = 1
    }
    let labels = [
    ["N", "V", "P", "Adj", "Adv", "Det", "Conj", "T", "S", "Deg", "C", "Perf", "Prog"],
    ["N", "V", "P", "Adj", "Adv", "Det", "Conj", "T", "S", "Deg", "Aux", "PossN", "C", "Perf", "Prog"],
    ["N", "V", "P", "Adj", "Adv", "Af"]
    ]
    let typeMenu = $("<div/>", { class: "typeMenu" }).append(
            [$("<div/>", { class: "typeItem", html: "'" }), $("<div/>", { class: "typeItem", html: "P" })])

    let labelDivArray = []

    if ($(this).parent().attr("data-selectionMode") == "morphology") {
        labelArrayID = 2
        typeMenu = "<br/>"
    }

    for (i of labels[labelArrayID]) {
        labelDivArray.push($("<div/>", { html: i, class: "labelItem" }))
    }

    let labelFilterSet = [{"phrase": ["S"], "non" : [], "bar": ["S"]}, 
                        {"phrase": ["S", "T"], "non" : ["Aux"], "bar": ["S", "Aux"]}]

    $(this).append($("<div/>", { class: "labelMenu" }).append([...labelDivArray, typeMenu]))
    labelFilters($(`.labelItem`), labelFilterSet[labelArrayID], "non");

    // drawLines()
    resizeWindow()

    let symbolMap = { "'": "bar", "P": "phrase", "P's": "possPhrase"}

    $(this).find(".typeItem").on({
        "click": function (e) {
            let labelHTML = $(this).html()
            for (symbol of Object.keys(symbolMap)) {
                // console.log(symbol, labelHTML)
                if (symbol != labelHTML) {
                    $(this).parent().parent().find(".labelItem").removeClass(symbolMap[symbol]).removeClass("possPhrase")
                    labelFilters($(`.labelItem`), labelFilterSet[labelArrayID], "non");
                }
            }
            let typedLabel = $(".labelItem")
            if (labelHTML == "P") {
                typedLabel = $(".labelItem").filter(el => ($(".labelItem")[el].innerHTML != ("Aux"))) //no add P after Aux
                let PossObject = $(".labelItem").filter(el => ($(".labelItem")[el].innerHTML == ("PossN")))
                typedLabel.push(PossObject) 
                PossObject.toggleClass(symbolMap["P's"]) //add not only P but add P's to PossN
            }
            typedLabel.toggleClass(symbolMap[labelHTML])
            if ($(`.${symbolMap[labelHTML]}`).length) {
                labelFilters($(`.${symbolMap[labelHTML]}`), labelFilterSet[labelArrayID], symbolMap[labelHTML]);
            } else {labelFilters($(`.labelItem`), labelFilterSet[labelArrayID], "non");}
        }
    })

    $(".labelItem").on({
        "click": function (e) {
            let classes = new Set($(this).attr("class").split(" "))
            let types = new Set(Object.values(symbolMap))
            let intersect = [...classes].filter(i => types.has(i))[0] || ""
            let symbol = inverse(symbolMap)[intersect] || ""
            let label = $(this).html() + symbol
            console.log(label)
            // replace ? with label and close menu
            $("#problemConstituent").attr("data-stepsUsed", parseInt($("#problemConstituent").attr("data-stepsUsed"))+1)
            // console.log(label,goldlabel)
            if ((mode == 'manual') || (mode == 'automatic' && label == correctLabel)) {
                // if (treeRow[row+1] && treeRow[row+1].some(x => x.label =="aux") && (goldlabel == "S" || goldlabel == "TP")) {
                //     makeSelectable("", row+1, 1, "syntax", wrongAnswer, "auxItem")
                // } //creating selection box for tense like -past
                removeMenu($(this).parent().parent(), label)
                $("#problemConstituent").attr("data-positivePoint", parseInt($("#problemConstituent").attr("data-positivePoint"))+1)
                finishAlarm()
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

function labelFilters(labelDiv, filterArray, status){
    $(".hide").removeClass("hide")
    if (status == "non") {$(".labelItem").filter(el => ($(".labelItem")[el].innerHTML == ("PossN"))).removeClass("possPhrase")}
    if (filterArray) {
    labelDiv.filter(x => {filterArray[status].forEach(y =>
        { 
            if (y == labelDiv[x].innerHTML){
            $(labelDiv[x]).addClass("hide")
        }
        })})} 
}

function tenseSelection(tenseElement) {
    var select = Object.assign(document.createElement("select"),{id:"tenseSelect", innerHTML:"Select for tense"});
    let optionSet = ["-","-s", "past", "∅"]
    optionSet.forEach(x => {
        let option = Object.assign(document.createElement("option"),{innerHTML:`${x}`, class: "tense"})
        select.appendChild(option);
    })
    // console.log(select)
    tenseElement.push(select)
}

function removeMenu(labelItem = $(".labelDiv"), label = "?") {
    // labelItem.css({ "width": "1.5em" })
    labelItem.removeAttr("style")
    if (label != "?") {
        labelItem.text(label)
    }
    $('.labelMenu').remove()
    // $(this).parent().remove() // cannot be reopened due to .one({}) // redundant?
    // $(this).parent().parent()
    // drawLines()
    resizeWindow()
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
        //console.log(node.attr("data-wastraced"), node.attr("data-destination"))
        if (node.attr("data-wastraced")) {
            leaf = leaf.replace(")", ` ^t${node.attr("data-wastraced")})`)
        }
        // allow for multiple movements? 
        if (node.attr("data-destination")) {
            leaf = leaf.replace(")", ` ^${node.attr("data-destination")})`)
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
        //console.log(node.attr("data-wastraced"), node.attr("data-destination"))

        if (node.attr("data-wastraced")) {
            tree = tree.replace(/\)$/, ` ^t${node.attr("data-wastraced")})`)
        }
        if (node.attr("data-destination")) {
            tree = tree.replace(/\)$/, ` ^${node.attr("data-destination")})`)
        }
        //console.log(tree)

        return tree
    }

}

function showProblem(event, problem) {
    // console.log(event.clientY)
    $("#problemInfo").remove()
    let note = problem.note || "";
    let problemInfo = `
    ${displayProblemRight(problem.expression)} <hr/>   ${note} 
    `
    $(stage).append($("<div/>", { id: "problemInfo", html: problemInfo}))
}

function displayProblemRight(bracketedString) {
    let morphoDetecter;
    let morphoDetecterForNext = false;
    let morphoWords = [];
    let displayString = ""
    let string = bracketToString(bracketedString).replaceAll("&#x2009;", " ")
    console.log(string)
    string.split(' ').forEach((word) => {
        morphoDetecter = false;
        // console.log(word)
        let wordIndex = bracketedString.indexOf(` ${word})`)
        if (morphoDetecterForNext || bracketedString.startsWith(("(N ") || ("(V ") || ("(P ") || ("(Adj ") || ("(Adv "))) {morphoDetecterForNext = false; morphoDetecter = true;}
        if (bracketedString[wordIndex - 2] == "A" && bracketedString[wordIndex - 1] == "f") {
            morphoWords.push(word);
            if (bracketedString[wordIndex+word.length+3] == "(") {
                morphoDetecterForNext = true;
            } 
            if (bracketedString[wordIndex+word.length+1] == ")") {
                morphoDetecter = true;
            }
        }
        if (word.includes("#")) {
            let intersect = word.indexOf("#")
            word = word.slice(0, intersect)
        }
        if (word.startsWith("'") || morphoDetecter) {
            displayString = displayString.concat(word);
        } else {
            displayString = displayString.concat(" ", word);
        }
    })

    return displayString.replaceAll("*", " ");
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

function treeToRows(tree, accumulator = [], row = 0, leaves = [], morphologyParts = []) {
    // try having index originate with leaves
    //console.log(leaves)
    //console.log(tree.trace, tree.index)
    accumulator[row] = accumulator[row] || []
    let highestColumn = 0
    let changed = "";
    //base case
    //string child
    if (!Array.isArray(tree.children)) {
        let index = leaves.length
        leaves.push(tree.children)
        let constituent;
        [constituent, changed] = changedWordDetector(tree.children, row);
        // accumulator[row].push({label:tree.label, constituent:tree.children, column:index})
        let newEntry = { label: tree.label, constituent: constituent, column: index }
        if (typeof tree.mode !== 'undefined') {
            morphologyParts.push(tree.children)
            $("#sentenceContainer").attr("data-morphologyparts", morphologyParts)
            // console.log(morphologyParts, tree.children)
        }
        if (changed != "") {
            newEntry['changed'] = changed
        }
        if (typeof tree.trace !== 'undefined') {
            newEntry['trace'] = tree.trace
            $("#problemConstituent").attr("data-targetRow", row)
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
            let [word, index] = treeToRows(child, accumulator, row + 1, leaves, morphologyParts)
            if (index > highestColumn) {
                highestColumn = index
            }
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
        // console.log(constituent)
        // accumulator[row].push({label:tree.label, constituent:constituent.join(" "), column:column})
        let groupedConstituent;
        [groupedConstituent, changed]= changedWordDetector(constituent.join(" "), row);
        let newEntry = { label: tree.label, constituent: groupedConstituent, column: column }
        if (typeof tree.trace !== 'undefined') {
            newEntry['trace'] = tree.trace
            $("#problemConstituent").attr("data-targetRow", row)
        }
        if (changed != "") {
            newEntry['changed'] = changed
        }
        if (typeof tree.mode !== 'undefined' && $("#sentenceContainer").attr("data-morphologyparts") == undefined) {
            $("#sentenceContainer").attr("data-morphologyparts", tree.children)
        }
        if (typeof tree.index !== 'undefined') {
            newEntry['destination'] = tree.index
        }
        accumulator[row].push(newEntry)
        if (row == 0) {
            return accumulator
        } else {
            if (mode == "morphology") {return [constituent.join(""), column]}
            // console.log([constituent.join(" "), column])
            return [constituent.join(" "), column]
        }
    }

}

function changedWordDetector(constituents, row) {
    let changedWordInput = []
    let numberOfRows;
    // console.log(constituents,row)
    if ($("#menu").attr("data-currentNumberOfRows")) 
        {numberOfRows = $("#menu").attr("data-currentNumberOfRows");} else {
            numberOfRows = 4
            return [constituents, ""]
        }
    if (!(constituents.includes("#"))) {return [constituents, ""]}
    let wordsSet = constituents.trim().split(/\s+/);
    let wordCount = wordsSet.length;
    let changed = "";
    let outputConstituent = constituents
    for (i = 0; i < wordCount; i ++) {
            if (wordsSet[i].includes("#")) {
                changedWordInput.push(wordsSet[i])
                $("#sentenceContainer").attr("data-changedword", changedWordInput)
                let changedWordSet = wordsSet[i].trim().split("#");
                let changedWordCount = changedWordSet.length;
                // console.log(changedWordCount, changedWordSet)
                let outputConstituentIndex =  Math.max(changedWordCount-(numberOfRows-row), 0);
                let changedWordIndex =  Math.max(changedWordCount-(numberOfRows-(row-1)), 0);
                if (wordCount == 1) {return [changedWordSet[outputConstituentIndex], changedWordSet[changedWordIndex]]}
                outputConstituent = wordsSet.toSpliced(i, 1, changedWordSet[outputConstituentIndex]).join(" ")
                // console.log(outputConstituent, changedWordSet[outputConstituentIndex], changedWordIndex, row, changedWordCount, wordsSet)
                if (changed != 0) {
                    changed = changed.trim().split(/\s+/).toSpliced(i, 1, changedWordSet[changedWordIndex]).join(" ")
                    // console.log(changed, outputConstituent)
                } else {changed = wordsSet.toSpliced(i, 1, changedWordSet[changedWordIndex]).join(" ")}
                if (!(outputConstituent.includes("#"))) {return [outputConstituent,changed]} else {
                    wordsSet = outputConstituent.trim().split(/\s+/)
                    // console.log(wordsSet, outputConstituent)
                }
            }
    }
}

function getRows() {
    //for manual use only, so did not varified that should "data-index" be "data-blockindex" or not
    // makes row structure with labels and constituents from DOM
    let structure = []
    $("#problemConstituent").find("[data-row]").each(function (row) {
        structure[row] = []
        // //console.log(row)
        //console.log($(this))
        $(this).children().each(function (block) {
            // //console.log(block)
            console.log($(this))
            let label = $(this).find(".labelDiv").text()
            //console.log(label)
            let constituent = $(this).find(".constituentContainer").find(".wordContainer").toArray().map((wordContainer) => { return wordContainer.innerHTML }).join(" ")
            //console.log(constituent)
            // structure[row].push({label:label, constituent:constituent, column:$(this).attr("data-index")})
            let newEntry = { label: label, constituent: constituent, column: $(this).attr("data-index") }
            //console.log($(this).attr("data-index"))
            //console.log($(this).attr("data-destination"), $(this).attr("data-wastraced"))
            if ($(this).attr("data-wastraced")) {
                newEntry['trace'] = $(this).attr("data-wastraced")
            }
            if ($(this).attr("data-destination")) {
                newEntry['destination'] = $(this).attr("data-destination")
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
                & (x.column === c.column || tracePad(i, x.column, c.column, tree)))))) { // or column it could have before trace changes it
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


function tracePad(row, xCol, cCol, tree) {
    // x and c actually have equivalent columns if the element at c's column and all elements up to x
    // are traces
    // console.log(xCol, cCol)
    // console.log(tree[row], tree)
    // console.log(row.filter(n => n.column >= cCol && n.column < xCol))

    if (!tree[row]) {
        return 0// avoiding error
    }

    // split into variables
    // filterval
    // empty array should be false not true
    let traceNum = 0
    for (let i = row; i < tree.length; i++) {
        let filterval = tree[i].filter(n => n.column >= 0 && n.column < xCol)
        // console.log(filterval)
        if (!filterval.length) { // is this how you do it?
            console.log("empty")
        }
        filterval.forEach(n => {
            // //console.log(typeof n.trace !== undefined)
            // console.log(n.trace)
            if (n.trace) {
                traceNum += 1
        }
        // return (typeof n.trace !== undefined)
        // return n.trace
    })
    }
    // console.log(traceNum)
    // let filterval = tree.filter(n => n.column >= 0 && n.column < xCol)
    // console.log(filterval)
    // if (!filterval.length) { // is this how you do it?
    //     console.log("empty")
    //     return 0
    // }
    // let traceNum = 0
    // filterval.forEach(n => {
    //     // //console.log(typeof n.trace !== undefined)
    //     console.log(n.trace)
    //     if (n.trace) {
    //         traceNum += 1
    //     }
    //     // return (typeof n.trace !== undefined)
    //     // return n.trace
    // })
    return traceNum;

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
    let minStep = getMinStep($("#sentenceContainer").attr("data-bracketedSentence"))
    let parFactor = getParFactor(minStep)
    let stepsUsed = parseInt($("#problemConstituent").attr("data-stepsUsed"))
    // console.log($("#problemConstituent").attr("data-stepsUsed"))
    $("#points").html(`Par: ${parseInt(minStep+parFactor)}<br/>Steps Used: ${stepsUsed}`)
}

function finishAlarm() {
    // console.log(globals.problemJSON)
    let currentSentenceID = parseInt($("#sentenceContainer").attr("data-currentSentenceID"))
    let minStep = getMinStep($("#sentenceContainer").attr("data-bracketedSentence"))
    let parFactor = getParFactor(minStep)
    let stepsUsed = parseInt($("#problemConstituent").attr("data-stepsUsed"))
    let positivePoint = parseInt($("#problemConstituent").attr("data-positivePoint"))
    let good = parseInt(minStep+parFactor)
    if (positivePoint == minStep) {
        let PJ=globals.problemJSON.holes[currentSentenceID];
        PJ.progress = PJ.progress || [] 
        PJ.progress.push(stepsUsed);
       console.log(JSON.stringify(PJ),stepsUsed)
	let bestStep = bestProgress(PJ.progress)
	 let {flagColor, alarmForBest} = getProgressSignal(bestStep,good,minStep)
        console.log(bestStep, good, minStep)
        color = `--color_fill: ${flagColor};`
        // console.log(color)
        $(`#${currentSentenceID}`).attr("style", color)
        // if (PJ.progress.length == 1) {enableNext()}
    let problem_id = parseQuery(window.location.search).problem_id || 1
    
	if (!(typeof ses=== "undefined")){
        ses.grade= globalScore(globals.problemJSON)/100;  
        console.log(ses)
        postLTI(ses,"du"); 
    }
    
    JSON_API(globals.problemJSON, problem_id,"POST").then(console.log)
    let {flagColor1, alarm} = getProgressSignal(stepsUsed,good,minStep)
    finishDialog(alarm)
    
}}

function finishDialog(properties) {
    document.querySelector("#dialog")?.remove();
    let dialog = Object.assign(document.createElement("dialog"), { "id": "dialog" })
    Object.keys(properties).forEach((prop) => {
        properties[prop].forEach((line) => {
            let current = Object.assign(document.createElement(prop), { "innerHTML": line })
            // current.addEventListener("click", (e) => { this.listen(e) })
            dialog.appendChild(current)

        })
    })
    document.querySelector("#sentenceContainer").append(dialog);
    dialog.show();
    // $("#dialog").append(meme)
}

function getProgressSignal(stepUsed, weightedPar, minStep) {
    if (stepUsed == undefined) {
        // problemJSON.holes[currentSentenceID].progress = []
        return {"flagColor":"white", "alarm":""}
    }
    if (stepUsed == minStep) {
        return {"flagColor":"blue", "alarm":{ div: ["Wonderful! You got it perfect!", `You completed this hole in ${stepUsed} attempts.`, "<img src='images/syntax_meme.png' id='finishMeme' />"]}}
    }
    else if (stepUsed > weightedPar) {
        return {"flagColor":"red", "alarm": { div: [`You did not complete this hole under par: ${stepUsed} attempts.`, "<img src='images/Chomsky_meme.png' id='finishMeme' />"]}}
    }
    else if (stepUsed <= weightedPar) {
        return {"flagColor":"green", "alarm":{ div: ["Wonderful! You got par!", `You completed this hole in ${stepUsed} attempts.`, "<img src='images/tree_meme.png' id='finishMeme' />"]}}
    }
}

function globalScore(problemJSON) {
    let numberOfHoles = problemJSON.holes.length
    let scores = 0
    let score
    problemJSON.holes.forEach((hole) => {
        bracketedSentence = hole.expression
        let min = getMinStep(bracketedSentence)
	    let userBest = bestProgress(hole.progress)
        let max = Math.max(min*3, 8)
        let range = max - min;
        let x = 1 - (userBest - min)/range
        score = Math.ceil(1/Math.pow((x-1.1),2)) || 0
        scores = scores + score
        console.log(min, userBest, max, score)
    })

    globalS = scores/numberOfHoles
    return globalS
}

function getNumberOfRows() {
    let bracketedSentence = $("#sentenceContainer").attr("data-bracketedSentence")
    let currentNumberOfRows = treeToRows(parse(bracketedSentence)).length;
    $("#menu").attr("data-currentNumberOfRows", currentNumberOfRows)
    // console.log(currentNumberOfRows)
}

function leftPad(rowJQ) {
    //console.log(rowJQ.children().first())
    // console.log(rowJQ)
    let firstItem = rowJQ.children().first()
    firstItem.addClass("first")
    let firstIndex = firstItem.attr("data-blockindex")
    rowJQ.css({ "padding-left": `${firstIndex * 8}em` })

    rowJQ.children().css({ "padding-left": 0 })
    //rowJQ.prepend($("<img/>"))
    // firstItem.css({ "padding-left": `${firstIndex * 10}rem` })
    console.log(firstItem.css("padding-left"))

}

function leftPadAll() {
    $("#problemConstituent").children().each(function (rownum, rowval) {
        // console.log(rownum, rowval)
        leftPad($(rowval))
    })
}

function findRowInPCM(id, pcm) {

    function findRowInPCM2(id, count = 0) {
        // console.log(id)
        // console.log(pcm)
        // console.log(Object.keys(pcm))
        // console.log(count, $(`#${id}`))
        //let count = 0
        // start from top? and count how many times it needs to recurse
        // or find parent and keep going until it reaches the top and count how many steps
        let parentID = Object.keys(pcm).filter(x => pcm[x].includes(id))[0]
        // console.log(parentID)

        if (parentID === undefined) {
            console.log(count)
            return count
        }
        else {
            //return count + findRowInPCM(parentID, pcm, count+1)
            //count = count + findRowInPCM2(parentID, count+1)
            let nextStep = findRowInPCM2(parentID, count + 1)
            count += nextStep
            // console.log(nextStep)
            console.log(count)
            return count
            // this gets too large
        }

    }
    return findRowInPCM2(id)

}
// delete?

function updateIndicesAfterTrace(trace) {
    // console.log($(trace))
    let j = $(trace).attr("data-blockindex")
    $("[data-blockindex].block").filter(function () {
        // console.log($(this))
        return $(this).attr("data-blockindex") >= j
    }).each((i, e) => {
        // console.log($(e))
        // update all except element itself and its ancestors
        if (!($(e).attr("id") === $(trace).attr("id") || isAncestor($(e), $(trace), getParentChildrenMap()))) {
            $(e).attr("data-blockindex", parseInt($(e).attr("data-blockindex")) + 1)
            $(e).attr("data-blockindex", $(e).attr("data-blockindex"))
        }
    })
}

function drawArrows() {
    // $("#lineContainer").empty()

    // console.log($(`[data-wastraced]`), $(`[data-destination]`))

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
    $(`[data-wastraced]`).each((i, block) => {
        // if ($(block).hasClass(".gu-mirror")) {
        if (block.classList.contains("gu-mirror")) {
            return;
        }
        // console.log(i, block)
        // console.log($(block).attr("data-wastraced"))
        let endPoint = $(block).find(".constituentContainer")

        // console.log($(`[data-destination=${$(block).attr("data-wastraced")}]`))
        let startPoint = $(`[data-destination=${$(block).attr("data-wastraced")}]`).find(".constituentContainer")

        // drawDot(endPoint)
        // drawDot(startPoint)

        // console.log(endPoint)
        // console.log(startPoint)

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
        let controlY = Math.max(endbottom, startbottom) + 200
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

function bezierCurve(t, initial, p1, p2, final) {
    return (
        (1 - t) * (1 - t) * (1 - t) * initial
        +
        3 * (1 - t) * (1 - t) * t * p1
        +
        3 * (1 - t) * t * t * p2
        +
        t * t * t * final
    );}


function getSize() {
    return [$("#lineContainer").width(), $("#lineContainer").height()]
}

function getCornerPercentages(elem) {
    let [left, top, right, bottom] = getCorners(elem)
    // console.log(left, top, right, bottom)
    let [containerWidth, containerHeight] = getSize()
    // console.log(containerWidth, containerHeight)
    let leftPercent = left / containerWidth * 100
    let rightPercent = right / containerWidth * 100
    let topPercent = top / containerHeight * 100
    let bottomPercent = bottom / containerHeight * 100
    //return Object.values({leftPercent, topPercent, rightPercent, bottomPercent})

    let centerXPercent = (leftPercent + rightPercent) / 2
    let centerYPercent = (topPercent + bottomPercent) / 2
    // console.log(leftPercent, topPercent, rightPercent, bottomPercent, centerXPercent, centerYPercent)
    return [leftPercent, topPercent, rightPercent, bottomPercent, centerXPercent, centerYPercent]

    // replace calculations in drawLine with this
}

function templateHelper(bracketedSentence) {
    let sentence = parse(bracketedSentence)
    let totalColumn = 0
    while (typeof sentence.children != string) {
        sentence.forEach(x => {
            if (typeof x.children == string) {
                totalColumn += x.children.split("\\s+").length
            } else {
                sentenceArray = x
            }
        })
    }
    console.log(totalColumn)
    return totalColumn
}

function getMinStep(bracketedSentence) {
    let str = bracketedSentence
    let minStep = 0
    let numberOfAf = 0;
    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) == "(") {
            minStep++
        }
        if (str.charAt(i) == "&") {
            numberOfAf++
        }
    }
    minStep = minStep * 2 - 1;
    minStep -= numberOfAf;
    return minStep
}

function getParFactor(minStep){
    return Math.max(minStep*0.2, 2)
}

function bestProgress(progress) {
    let progressCopy
    if (progress == undefined) {
        progressCopy = []
    } else {
        progressCopy = progress.slice()
    }
    // function(a, b){return a - b}
    let sortedProgress = progressCopy.sort(function(a, b){return a - b})
    // console.log(sortedProgress)
    return sortedProgress[0]
}
