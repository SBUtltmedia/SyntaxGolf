let ast = [`(S
    (NP Alice)
    (VP
       (V chased)
       (NP
          (D the)
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
        (AP 
            (A' 
            (A where)) ^1) 
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
(AP 
    (A' 
        (A where)) ^t1) 
        (DP 
            (D' 
                (D that) 
                (NP 
                    (N' 
                        (N hat)))))))))))`
    ]


function generateExamples(){
    
let examples = [`(S
    (NP Alice)
    (VP
       (V chased)
       (NP
          (D the)
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
        (AP 
            (A' 
            (A where)) ^1) 
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
(AP 
    (A' 
        (A where)) ^t1) 
        (DP 
            (D' 
                (D that) 
                (NP 
                    (N' 
                        (N hat)))))))))))`
    ]
examples.forEach(example=>{
    document.querySelector("#examples").append(Object.assign(document.createElement("a"), {innerHTML:bracketToString(example), href:`test.html?string=${encodeURIComponent(example)}`}))
    document.querySelector("#examples").append(document.createElement("br"))
})

}