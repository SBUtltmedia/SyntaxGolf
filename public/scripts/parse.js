
function parse(sentence = `(S
    (NP Alice)
    (VP
       (V chased)
       (NP
          (Det the)
          (N rabbit))))`)
          {

sentence= sentence.replace(/[\r\n]/gm, '');

sentence =sentence.replaceAll("[","(").replaceAll("]",")");
//console.log(sentence)
let label= sentence.match(/^\(([^ ]*)/)[1].trim()
//console.log(label)
let tree={"label":label}
//console.log(tree)
let parenCount=0
//let rightParenCount=0
let leftPlaceHolder=0;
// let rightPlaceHoder=0;
tree.children=[]
// tree.index=[]
// tree.trace=[]

prevChar = ""
hasTrace = false

sentence.split("").forEach((char,index)=>{
    
    if (hasTrace==true) {
        tree.trace = char
        hasTrace = false
        //console.log("trace")
        //console.log(char)
    }
    
    if (prevChar=="^" & parenCount==1) {
        if (char=="t") {
            hasTrace = true
        }
        else {
            tree.index = char
            //console.log("index")
            //console.log(char)
        }

    }

    if (char=="(") {
    parenCount++
    if(parenCount==2){

        leftPlaceHolder=index

    }
    }
    if (char==")") 
    {
        parenCount--
        if(parenCount==1)
        {
            tree.children.push(parse(sentence.substring(leftPlaceHolder,index+1)))
        
        }
    }
    // console.log(prevChar)
    prevChar = char
    // console.log(prevChar)
})

if(tree.children.length==0)
{
    let [g,...text]=  sentence.split(" ")

    text = text.filter(word=>!word.includes("^"))   
         console.log(text)
    // if (text.length > 1) {
    //     // text.pop() // make this only affect ^ using includes
    //     // this causes a bug for parse(getTree())
    //     // which is not used now but may be in the future
    //     console.log("pop")
    // }
   // text = text.split("^")[0]
    // console.log(text)
    tree.children=text.join(" ").split(")")[0]
    // console.log(tree.children)
}
 console.log(tree)
return tree
}



//let label= sentence.match(/^\(([^\(]*)/)[1].trim()
//let children= JSON.stringify(sentence.match(/\([^\(]*(\([^\)]*\))/g))

// TO DO: make parse work with traces
// also think about implementing this in the game with drag and drop






    

// function getOuterParens(sentence){
// let items=[]
// let counter=0;
// let start=0;
// sentence.split("").forEach((letter,index)=>{

//     if(letter=="(")
//     {
//         counter++;
//         if(start==0){ 
//         start=index;
//         }

// })

// }
      