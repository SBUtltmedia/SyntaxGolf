// use runtests.html to view results

// function assert(returnVal, expectedVal) {
//     console.log(returnVal == expectedVal)
// }

let tree = treeToRows(parse(`(S (NP Mary) (VP (V had) (NP (D a) (N' (Adj little) (N lamb)))))`))

// Correct Examples (should return true)

// basic subtree
let subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb"}],[{"label":"NP","constituent":"Mary"},{"label":"VP","constituent":"had a little lamb"}]]')
console.log(isValid(tree, subtree) == true) 

// missing words
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb"}],[{"label":"NP","constituent":"Mary"}]]')
console.log(isValid(tree, subtree) == true)
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb"}],[{"label":"NP","constituent":"Mary"},{"label":"VP","constituent":"had a little lamb"}],[{"label":"V","constituent":"had"}]]')
console.log(isValid(tree, subtree) == true)

// missing labels
subtree = JSON.parse('[[{"label":"?","constituent":"Mary had a little lamb"}],[{"label":"?","constituent":"Mary"},{"label":"?","constituent":"had a little lamb"}]]')
console.log(isValid(tree, subtree) == true)

// right heavy
subtree = JSON.parse('[[{"label":"?","constituent":"Mary had a little lamb"}],[{"label":"?","constituent":"had a little lamb"}],[{"label":"?","constituent":"a little lamb"}],[{"label":"?","constituent":"little lamb"}],[{"label":"?","constituent":"lamb"}]]')
console.log(isValid(tree, subtree) == true)


// Incorrect Examples (should return false)

// too many divisions
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb"}],[{"label":"?","constituent":"Mary"},{"label":"?","constituent":"had"},{"label":"?","constituent":"a little lamb"}]]')
console.log(isValid(tree, subtree) == false)

// wrong divisions
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb"}],[{"label":"?","constituent":"Mary had"},{"label":"?","constituent":"a little lamb"}]]')
console.log(isValid(tree, subtree) == false)

// wrong label
subtree = JSON.parse('[[{"label":"S","constituent":"Mary had a little lamb"}],[{"label":"NP","constituent":"Mary"},{"label":"V","constituent":"had a little lamb"}]]')
console.log(isValid(tree, subtree) == false)