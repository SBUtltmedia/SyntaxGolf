// app.js
const express = require('express')
const fs = require('node:fs');
const app = express()
const port = process.env.PORT || 3000
let netID = "LIU36".toLowerCase()
app.use(express.static('public'))
app.post('/saveData', function(request, respond) {
    var body = '';
    let problem_id = request.query.problem_id||1
    let filePath = `./public/userData/${netID}/${problem_id}.json`
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){
        fs.appendFile(filePath, body, function() {
            respond.end();
        });
    });
});

app.get('/problem_set', (req, res) => 
{
    let problem_id = req.query.problem_id||1
    let fileName = `./public/userData/${netID}/${problem_id}.json`
    if (!fs.existsSync(fileName)) {
        fileName = `./public/problem_sets/problem_${problem_id}.json`
    }
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        res.send(data);
      });
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
