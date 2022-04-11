const http = require('http');
var fs = require('fs');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Password",
    database: "users"
  });

function connectToDb(){
    con.connect(function(err) {
    if (err) throw err;
        console.log('Connected to the "users" database!');
    });
}

function addUser(data, res){
    var arr = new Array();

    const promise = new Promise(function(resolve, reject){

        //get amount of users with same phonenum
        con.query(`SELECT * FROM users WHERE phonenum = '${data[2]}'`, function (err, result) {
            if (err) throw err;
            resolve(result.length);
        });
    });

    //handling the promise
    promise.then(function(phonenumAmo){
        arr.push(phonenumAmo);

        //Return another promise
        return new Promise(function(resolve, reject){
            con.query(`SELECT * FROM users WHERE email = '${data[3]}'`, function (err, result) {
                if (err) throw err;
                resolve(result.length);
            });
        });
    })
    .then(function(emailAmo){
        arr.push(emailAmo);
        setTimeout(() => console.log(arr), 1000);
    })
}

function writeHtmlContent(filename, res){
    fs.readFile(filename, function(err, htmlcontent) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(htmlcontent);
        return res.end();
    });
}

function decodeAndSplit (str){
    var result = new Array();
    str = decodeURIComponent(str);
    str = str.replace(/&/g, "=").split("=");
    for(var i = 1;i < str.length; i = i + 2){
        result.push(str[i]);
    }
    return result;
}

//--MAIN--
connectToDb();
var data = new Array();

http.createServer(function (req, res) {

    if(req.url === "/"){

        //Load home.html
        var filename = 'home.html';
        writeHtmlContent(filename, res);
    }
    else
    if(req.url === "/signup"){

        //Load signup.html
        var filename = 'signup.html';
        writeHtmlContent(filename, res);

        //Get post request
        req.on('data', chunk => {
            //console.log('test10');
            data = decodeAndSplit(chunk);
        })
    }
    else
    if(req.url === "/signup_status"){

        //Load signup_success.html
        var filename = 'signup_status.html';
        writeHtmlContent(filename, res);

        //Add user
        addUser(data, res);
    }
}).listen(5000);