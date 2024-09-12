function bracketToString(bracket) {
    
    // first get rid of trace word(s)
    let matches = [...bracket.matchAll(/\^t\d+\)/g)]
    let slices = []
    //console.log(matches)
    matches.forEach((m) => {
        let rightIndex = m[0].length + m.index
        let parenCount = 1
        for (i = rightIndex-2; i > 0; i--) {
            if (bracket[i]==")") {
                parenCount++
            }
            if (bracket[i]=="(") {
                parenCount--
            }
            if (parenCount == 0) {
                let leftIndex = i
                slices.push(bracket.slice(leftIndex,rightIndex))
                //console.log(slices)
                break
            }
        }
    })
    slices.forEach((slice) => {
        // console.log(slice)
        bracket = bracket.replace(slice, '')
    })
    // console.log(bracket)

    fixedBracket = bracket
    .replace(/\([^ ]* /g, '') // get rid of left parenthesis and label
    .replace(/  +/g, ' ') // get rid of extra white spaces
    .replace(/ \^[^ ]*/g, ')') // get rid of carets
    .replace(/ $/g, '') // get rid of space at end of line

    let word = parseQuery(window.location.search).word || false;
    if (word) {
        fixedBracket = fixedBracket.replace(/\s+/g, "").replaceAll(")&#x2000;", "").replaceAll("&#x2000;)", "")
    } else {
        fixedBracket = fixedBracket.replace(/\s+/g, "&#x2000;").replaceAll(")&#x2000;", ") ").replaceAll("&#x2000;)", ")")
    }
    // console.log(fixedBracket)

    return fixedBracket
    .replace(/\)/g, '') // get rid of right parenthesis
    .replace(/ $/g, '') // get rid of space at end of line

}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '').replaceAll("+"," ");
    }
    return query;
}