function JSON_API(json = {}, id = 1, method = "GET", mode = "user") {
    console.log(mode, json);
    let param = [];
    if (method == "POST") {
        var data = new FormData();
        data.append("mode", mode);
        data.append("json", JSON.stringify(json, null, 2));
        // payload.body=data;
        // // console.log(payload)
        // let headers = {"Access-Control-Allow-Origin" : "*", 
        //     'content-type': 'application/json'}
        param = [{ method, body: data }]
    }
    let problem_id = id || 1
    let query = ""
    if (mode == "admin") {
        query = "&mode=admin"
    }

    let URL = `problem_set/?problem_id=${problem_id}${query}`
    if (window.location.href.includes("github.io")) {
        URL = `problem_sets/problem_${problem_id}.json${query}`
    }
    if (window.location.href.includes("stonybrook")) {
        URL = `problem_set.php?id=${problem_id}${query}`
    }
    param.unshift(URL);
    console.log(param)
    return fetch(...param)
        .then(res => {
            if (res.status >= 200 && res.status < 300) {
                console.log(res);
                return res.json()
            } else {
                throw new Error();
            }
            
        })
        .then((data) => { return data })
        
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '').replaceAll("+", " ");
    }
    //console.log(query)
    return query;
}