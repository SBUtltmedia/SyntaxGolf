function JSON_API(json={}, id=1,method="GET") {
    let payload={method}
    if(method=="POST"){
    var data = new FormData();
    data.append( "json", JSON.stringify( json ) );
    payload.body=data;

    }
    let problem_id = parseQuery(window.location.search).problem_id || 1
	let URL = `problem_set/?problem_id=${problem_id}`
    if (window.location.href.includes("github.io")) {
        URL = `problem_sets/problem_${problem_id}.json`
    }
	if (window.location.href.includes("stonybrook")) {
        URL= `problem_set.php?id=${problem_id}`
    	}
       return fetch(URL,payload)
             .then(function (res) { return res.json(); })
            .then(function (data) { return data })
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