// app.js
const express = require('express')
const fs = require('node:fs');
const multer = require('multer');
const upload = multer();
const app = express()
const port = process.env.PORT || 3000
const allowList = ["liu36", "pstdenis"];
let filePath;
let netID;
let dataPath = "./data"
app.use(express.static('public'))
app.post('/problem_set', upload.none(), function(req, respond) {
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath)
    }
    let userDir = `${dataPath}/${netID}`
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir)
    }
    var body = '';
    let problem_id = req.query.problem_id||1
 filePath = `${userDir}/${problem_id}.json`
 if (req.body.mode) {
     filePath = `public/problem_sets/problem_${problem_id}.json`
 }

    // request.on('data', function(data) {
    //     body += data;
    // });

    // request.on('end', function (){
    //     console.log(JSON.stringify(body));
    console.log(req.body.mode);
        fs.writeFile(filePath,  req.body.json.toString(), function() {
            respond.end();
        });
    // });
});

app.get('/problem_set', (req, res) => 
{
    let problem_id = req.query.problem_id||1
    let fileName = `${dataPath}/${netID}/${problem_id}.json`
    if (!fs.existsSync(fileName) || req.query.mode == "admin") {
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

app.get('/set_NetID', (req, res) => 
    {
       netID = req.query.netID||"Bob"
       res.send(netID);
    })
    
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
