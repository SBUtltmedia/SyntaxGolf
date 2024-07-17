function bracketToString(bracket) {
    
    // first get rid of trace word(s)
    let matches = [...bracket.matchAll(/\^t\d+\)/g)]
    let slices = []
    //console.log(matches)
    matches.forEach((m) => {
        //console.log(m)
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
        //console.log(slice)
        bracket = bracket.replace(slice, '')
    })
    //console.log(bracket)

    return bracket
    .replace(/\([^ ]* /g, '') // get rid of left parenthesis and label
    .replace(/\)/g, '') // get rid of right parenthesis
    .replace(/  +/g, ' ') // get rid of extra white spaces
    .replace(/ \^[^ ]*/g, '') // get rid of carets
    .replace(/ $/g, '') // get rid of space at end of line

}