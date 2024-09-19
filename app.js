// app.js
const express = require('express')
const fs = require('node:fs');
const multer = require('multer');
const upload = multer();
const app = express()
const port = process.env.PORT || 3000
let netID = "LIU36".toLowerCase()
let dataPath = "./data"
app.use(express.static('public'))
app.post('/problem_set', upload.none(), function(request, respond) {
    if (!fs.existsSync(dataPath)) {
        fs.mkdir(dataPath)
    }
    let userDir = `${dataPath}/${netID}`
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir)
    }
    var body = '';
    let problem_id = request.query.problem_id||1
    let filePath = `${userDir}/${problem_id}.json`
    // request.on('data', function(data) {
    //     body += data;
    // });

    // request.on('end', function (){
    //     console.log(JSON.stringify(body));
 
        fs.writeFile(filePath,  request.body.json.toString(), function() {
            respond.end();
        });
    // });
});

app.get('/problem_set', (req, res) => 
{
    let problem_id = req.query.problem_id||1
    let fileName = `${dataPath}/${netID}/${problem_id}.json`
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
