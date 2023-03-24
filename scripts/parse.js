
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
console.log(sentence)
let label= sentence.match(/^\(([^ ]*)/)[1].trim()
console.log(label)
let tree={"label":label}
console.log(tree)
let parenCount=0
//let rightParenCount=0
let leftPlaceHolder=0;
// let rightPlaceHoder=0;
tree.children=[]
sentence.split("").forEach((char,index)=>{
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
}})
if(tree.children.length==0)
{
    let [g,...text]=  sentence.split(" ")
    console.log(text)
    tree.children=text.join(" ").split(")")[0]
    console.log(tree) 
}
console.log(tree)
return tree
}




//let label= sentence.match(/^\(([^\(]*)/)[1].trim()
//let children= JSON.stringify(sentence.match(/\([^\(]*(\([^\)]*\))/g))






    

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
      