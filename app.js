const http = require('http');
var fs = require('fs');
const { Pool } = require('pg');

const con = new Pool({
    user: 'admin',
    database: 'tesdb',
    password: 'password',
    port: 5432,
    host: 'localhost',
})

function connectToDb(){
    con.connect(function(err) {
    if (err) throw err;
        console.log('Connected to the "tesdb" database!');
    });
}

function dbFunc(sql, res){
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Success: " + sql);
      res.write('<label>A user has been created!</label><br>');
      var filename = 'homebutton.html';
        fs.readFile(filename, function(err, htmlcontent) {
            res.write(htmlcontent);
            return res.end();
        });
    });
  }

function sqlCommandGen(data){
    var sql = `INSERT INTO userstable (firstname, lastname, phonenum, email, password) VALUES ('${data[0]}', '${data[1]}', '${data[2]}', '${data[3]}', '${data[4]}')`;
    return sql;
}

function addUser(data, res){
    var arr = new Array();

    const promise = new Promise(function(resolve, reject){

        //get amount of users with same phonenum
        con.query(`SELECT * FROM userstable WHERE phonenum = '${data[2]}'`, function (err, result) {
            if (err) throw err;
            resolve(result.rows.length);
        });
    });

    //handling the promise
    promise.then(function(phonenumAmo){
        arr.push(phonenumAmo);

        //Return another promise
        return new Promise(function(resolve, reject){
            con.query(`SELECT * FROM userstable WHERE email = '${data[3]}'`, function (err, result) {
                if (err) throw err;
                resolve(result.rows.length);
            });
        });
    })
    .then(function(emailAmo){
        arr.push(emailAmo);
        if(arr.includes(1)){
            console.log(arr);
            console.log('A user with the same email or/and phone number exists.');
            res.write('<label>A user with the same email or/and phone number already exists. Could not create user.</label><br>');

            var filename = 'homebutton.html';
            fs.readFile(filename, function(err, htmlcontent) {
                res.write(htmlcontent);
                return res.end();
            });
        }
        else
        {
            console.log(arr);
            console.log('Creating user... Please wait...');
            res.write('<label>Creating user... Please wait... </label><br>');
            //console.log(sqlCommandGen(data));
            dbFunc(sqlCommandGen(data), res);
        }
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
            data = decodeAndSplit(chunk);
        })
    }
    else
    if(req.url === "/signup_status"){

        //Load signup_success.html
        var filename = 'signup_status.html';
        fs.readFile(filename, function(err, htmlcontent) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(htmlcontent);
        });

        //Add user
        addUser(data, res);
    }
    else
    if(req.url === '/login'){

        //Load signup.html
        var filename = 'login.html';
        writeHtmlContent(filename, res);

        //Get post request
        req.on('data', chunk => {
            data = decodeAndSplit(chunk);
            console.log(data);
        })

    }
    else
    if(req.url === '/verifying_login'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('Verifying login details.');
    }
}).listen(5000);
