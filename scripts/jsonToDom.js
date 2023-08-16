
function jsonToDom(tree) {
    console.log(tree)
    console.log(typeof tree)
    if (typeof tree === "string") {
        console.log("converting")
        tree = JSON.parse(tree)
    }
    console.log(tree)
    tree = treeToRows(tree)
    console.log(tree)

    // clear body first? would multiple with same id be a problem?
    // if (!$("#stage").length) {
    //     $("body").append($("<div/>", {id:"stage"}))
    // }
    // $("#stage").empty()

    // $("body").append($("<div/>", {id:"stage"}).append($("<svg/>", {id:"lineContainer"}))
    // .append($("<div/>", {id:"problemConstituent", class:"block"})))
    
    // $("#stage").append($("<svg/>", {id:"lineContainer", xmlns:"http://www.w3.org/2000/svg"}))
    // .append($("<div/>", {id:"problemConstituent", class:"block"}))

    $("#lineContainer, #problemConstituent").empty()

    // making the tree
    tree.forEach((row, i) => {
        console.log(row)
        $("#problemConstituent").append($("<div/>", {"data-row":`${i}`, class:"container", id:`row${i}`}))
        row.forEach(block => {
            console.log(block)
            // errors from IDs being identical
            let blockID = Math.floor(Date.now() + Math.random() * 1000000)
            $(`#row${i}`).append($("<div/>",{id:blockID, "data-index":block["column"], class:"block"})
            .append([$("<div/>", {class:"labelDiv", html:`${block["label"]}`}), 
            $("<div/>", {class:"constituentContainer"})])) // check whether to add hidden
            block["constituent"].split(' ').forEach((word, j) => {
                console.log(word, j)
                console.log($(`#${blockID}`).find(".constituentContainer"))
                $(`#${blockID}`).find(".constituentContainer").append($("<div/>", {html:word, "data-index":j, class:"wordContainer"}))
                // check whether to add faded
            })
            console.log(block["trace"], block["destination"])
            // needs to exist in output of treeToRows
            if (block["trace"]) {
                $(`#${blockID}`).attr("data-trace", block["trace"]) // get dragula to do this
            }
            if (block["destination"]) {
                $(`#${blockID}`).attr("data-destination", block["destination"])
            }
        })
    })

    // add faded
    console.log($(".wordContainer"))
    let pcm = getParentChildrenMap()
    console.log(pcm)
    $(".wordContainer").each((i, word) => {
        // only if there are children
        if ($(word).parent().parent().attr("id") in pcm) {
            let column = $(word).data("index") + $(word).parent().parent().data("index")
        
            let children = pcm[$(word).parent().parent().attr("id")].map(childID => $(`#${childID}`))

            // do children contain matching word with matching column
            // does there exist a child such that there exists a word within it that matches both word and column
            if (children.some(child => child.find(".constituentContainer").find(".wordContainer").toArray()
            .some(wordC => (wordC.innerHTML === word.innerHTML) && 
            (column === $(wordC).data("index") + $(wordC).parent().parent().data("index"))))) {
                console.log("faded")
                $(word).addClass("faded")
            }
        }
    })

    // add hidden
    $(".constituentContainer").each((i, constituent) => {
        if($(constituent).find(".faded").length == $(constituent).children().length) {
            $(constituent).addClass("hidden")
        }
    })

    resizeWindow()
    drawLines()

    // draw curves between matching traces and destinations
    // maybe should be part of drawLines() ?
    console.log($(`[data-trace]`), $(`[data-destination]`))
    // try it here and move to drawLines() or new function drawCurve() later
    $(`[data-trace]`).each((i, block) => {
        console.log(i, block)
        console.log($(block).data("trace"))
        let endPoint = $(block)
        console.log($(`[data-destination=${$(block).data("trace")}]`)) 
        let startPoint = $(`[data-destination=${$(block).data("trace")}]`)
        // how to find control point(s)? 
        // calculate point coordinates
        let [endleft, endtop, endright, endbottom] = getCorners(endPoint)
        let endCenterX = (endleft+endright) / 2
        let [startleft, starttop, startright, startbottom] = getCorners(startPoint)
        let startCenterX = (startleft+startright) / 2
        console.log(endCenterX, endbottom)
        console.log(startCenterX, startbottom)
        // test by drawing dots
        var shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        $("#lineContainer").append(shape);
        $(shape).attr({cx:`${endCenterX}px`, cy:`${endbottom}px`, r:"0.4%"});
        var shape2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        $("#lineContainer").append(shape2);
        $(shape2).attr({cx:`${startCenterX}px`, cy:`${startbottom}px`, r:"0.4%"});
    })


    

}