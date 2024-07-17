// use runtests.html to view results

// function assert(returnVal, expectedVal) {
//     console.log(returnVal == expectedVal)
// }

let tree = treeToRows(parse(`(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))`))
let tree2 = treeToRows(parse(`(S (NP buffalo) (VP (V buffalo) (NP buffalo)))`))
let tree3 = treeToRows(parse(`(S (NP (Adj Buffalo) (N buffalo)) (VP (V buffalo) (NP buffalo)))`))

// Correct Examples (should return true)

// basic subtree
let subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0},{"label":"VP","constituent":"had a little lamb", "column":1}]]')
console.log(isValid(tree, subtree) == true) 
let subtree2 = JSON.parse('[[{"label":"S","constituent":"buffalo buffalo buffalo","column":0}],[{"label":"NP","constituent":"buffalo","column":0},{"label":"VP","constituent":"buffalo buffalo","column":1}]]')
console.log(isValid(tree2, subtree2) == true)
let subtree3 = JSON.parse('[[{"label":"S","constituent":"Buffalo buffalo buffalo buffalo","column":0}],[{"label":"NP","constituent":"Buffalo buffalo","column":0},{"label":"VP","constituent":"buffalo buffalo","column":2}]]')
console.log(isValid(tree3, subtree3) == true)

// missing words
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0}]]')
console.log(isValid(tree, subtree) == true)
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0},{"label":"VP","constituent":"had a little lamb", "column":1}],[{"label":"V","constituent":"had", "column":1}]]')
console.log(isValid(tree, subtree) == true)
subtree2 = JSON.parse('[[{"label":"S","constituent":"buffalo buffalo buffalo","column":0}],[{"label":"NP","constituent":"buffalo","column":0}]]')
console.log(isValid(tree2, subtree2) == true)
subtree3 = JSON.parse('[[{"label":"S","constituent":"Buffalo buffalo buffalo buffalo","column":0}],[{"label":"NP","constituent":"Buffalo buffalo","column":0}]]')
console.log(isValid(tree3, subtree3) == true)

// missing labels
subtree = JSON.parse('[[{"label":"?","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"Mary", "column":0},{"label":"?","constituent":"had a little lamb", "column":1}]]')
console.log(isValid(tree, subtree) == true)
subtree2 = JSON.parse('[[{"label":"?","constituent":"buffalo buffalo buffalo","column":0}],[{"label":"?","constituent":"buffalo","column":0},{"label":"?","constituent":"buffalo buffalo","column":1}]]')
console.log(isValid(tree2, subtree2) == true)
subtree3 = JSON.parse('[[{"label":"?","constituent":"Buffalo buffalo buffalo buffalo","column":0}],[{"label":"?","constituent":"Buffalo buffalo","column":0},{"label":"?","constituent":"buffalo buffalo","column":2}]]')
console.log(isValid(tree3, subtree3) == true)

// right heavy
subtree = JSON.parse('[[{"label":"?","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"had a little lamb", "column":1}],[{"label":"?","constituent":"a little lamb", "column":2}],[{"label":"?","constituent":"little lamb", "column":3}],[{"label":"?","constituent":"lamb", "column":4}]]')
console.log(isValid(tree, subtree) == true)


// Incorrect Examples (should return false)

// too many divisions
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"Mary", "column":0},{"label":"?","constituent":"had", "column":1},{"label":"?","constituent":"a little lamb", "column":2}]]')
console.log(isValid(tree, subtree) == false)
subtree2 = JSON.parse('[[{"label":"S","constituent":"buffalo buffalo buffalo","column":0}],[{"label":"?","constituent":"buffalo","column":0},{"label":"?","constituent":"buffalo","column":1},{"label":"?","constituent":"buffalo","column":2}]]')
console.log(isValid(tree2, subtree2) == false)
subtree3 = JSON.parse('[[{"label":"S","constituent":"Buffalo buffalo buffalo buffalo","column":0}],[{"label":"?","constituent":"Buffalo","column":0},{"label":"?","constituent":"buffalo","column":1},{"label":"?","constituent":"buffalo","column":2},{"label":"?","constituent":"buffalo","column":3}]]')
console.log(isValid(tree3, subtree3) == false)

// wrong divisions
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"?","constituent":"Mary had", "column":0},{"label":"?","constituent":"a little lamb", "column":2}]]')
console.log(isValid(tree, subtree) == false)
subtree3 = JSON.parse('[[{"label":"S","constituent":"Buffalo buffalo buffalo buffalo","column":0}],[{"label":"?","constituent":"Buffalo buffalo buffalo","column":0},{"label":"?","constituent":"buffalo","column":3}]]')
console.log(isValid(tree3, subtree3) == false)

// wrong label
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb", "column":0}],[{"label":"NP","constituent":"Mary", "column":0},{"label":"V","constituent":"had a little lamb", "column":1}]]')
console.log(isValid(tree, subtree) == false)
subtree2 = JSON.parse('[[{"label":"S","constituent":"buffalo buffalo buffalo","column":0}],[{"label":"N","constituent":"buffalo","column":0},{"label":"VP","constituent":"buffalo buffalo","column":1}]]')
console.log(isValid(tree2, subtree2) == false)
subtree2 = JSON.parse('[[{"label":"S","constituent":"buffalo buffalo buffalo","column":0}],[{"label":"VP","constituent":"buffalo","column":0},{"label":"NP","constituent":"buffalo buffalo","column":1}]]')
console.log(isValid(tree2, subtree2) == false)
subtree3 = JSON.parse('[[{"label":"S","constituent":"Buffalo buffalo buffalo buffalo","column":0}],[{"label":"N","constituent":"Buffalo buffalo","column":0}]]')
console.log(isValid(tree3, subtree3) == false)