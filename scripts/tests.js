// use runtests.html to view results

// function assert(returnVal, expectedVal) {
//     console.log(returnVal == expectedVal)
// }

let tree = treeToRows(parse(`(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))`))

// Correct Examples (should return true)

// basic subtree
let subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0},{"label":"VP","constituent":"had a little lamb", "column":1}]]')
console.log(isValid(tree, subtree) == true) 

// missing words
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0}]]')
console.log(isValid(tree, subtree) == true)
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0},{"label":"VP","constituent":"had a little lamb", "column":1}],[{"label":"V","constituent":"had", "column":1}]]')
console.log(isValid(tree, subtree) == true)

// missing labels
subtree = JSON.parse('[[{"label":"?","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"Mary", "column":0},{"label":"?","constituent":"had a little lamb", "column":1}]]')
console.log(isValid(tree, subtree) == true)

// right heavy
subtree = JSON.parse('[[{"label":"?","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"had a little lamb", "column":1}],[{"label":"?","constituent":"a little lamb", "column":2}],[{"label":"?","constituent":"little lamb", "column":3}],[{"label":"?","constituent":"lamb", "column":4}]]')
console.log(isValid(tree, subtree) == true)


// Incorrect Examples (should return false)

// too many divisions
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"Mary", "column":0},{"label":"?","constituent":"had", "column":1},{"label":"?","constituent":"a little lamb", "column":2}]]')
console.log(isValid(tree, subtree) == false)

// wrong divisions
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"Mary had", "column":0},{"label":"?","constituent":"a little lamb", "column":2}]]')
console.log(isValid(tree, subtree) == false)

// wrong label
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0},{"label":"V","constituent":"had a little lamb", "column":1}]]')
console.log(isValid(tree, subtree) == false)