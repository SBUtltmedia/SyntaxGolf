
function generateExamples(){
    
let examples = [`(S
    (NP Alice)
    (VP
       (V chased)
       (NP
          (Det the)
          (N rabbit))))`, 
    `(CP 
        (NP who ^1) 
        (C' 
            (C did) 
            (S 
                (NP Lucy) 
                (VP 
                    (V see) 
                    (NP who ^t1)))))`, 
    `(CP 
        (AdvP 
            (Adv' 
            (Adv where)) ^1) 
            (C' 
            (C did ^2) 
            (TP 
                (NP 
                    (N' 
                        (N you))) 
                    (T'
                        (T did ^t2) 
                    (VP 
                        (V' 
                            (V get) 
(AdvP 
    (Adv' 
        (Adv where)) ^t1) 
        (DetP 
            (Det' 
                (Det that) 
                (NP 
                    (N' 
                        (N hat)))))))))))`, 
    `(S (NP Mary) (Aux (T will) (Perf have)) (VP (V go) (Af ne#en)))`, 
    `(N (V (Af re) (V creat#create)) (Af ion))`, 
    `(CP 
        (NP who ^1) 
        (C' 
            (C did) 
            (S 
                (NP Lucy) 
                (VP 
                    (V think) 
(CP
        (NP who ^2^t1)
        (C' 
            (C that) 
            (S 
                (NP Max) 
                (VP
                    (V saw) 
                    (NP who ^t2)))))))))`
    ]
examples.forEach(example=>{
    document.querySelector("#examples").append(Object.assign(document.createElement("a"), {innerHTML:bracketToString(example), href:`test.html?string=${encodeURIComponent(example)}`}))
    document.querySelector("#examples").append(document.createElement("br"))
})

}