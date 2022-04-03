const http = require('http');
var fs = require('fs');

function decodeAndSplit (str){
    var result = new Array();
    str = decodeURIComponent(str);
    str = str.replace(/&/g, "=").split("=");
    for(var i = 1;i < str.length; i = i + 2){
        result.push(str[i]);
    }
    return result;
}

http.createServer(function (req, res) {

    var data;
    if(req.url === "/create_user")
    {
        req.on('data', chunk => {
        data = decodeAndSplit(chunk);
        console.log(data);
      })

      req.on('end', () => {
        res.end();
      })

      res.writeHead(301, {
        Location: `/main.html`
      }).end();
    }
    else
    if(req.url === "/main.html")
    {
        var filename = 'main.html';
    }
    fs.readFile('main.html', function(err, htmlcontent) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(htmlcontent);
        return res.end();
      });
  }).listen(5000);
