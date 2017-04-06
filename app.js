
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

// create a new express server
var app = express();

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use('/style', express.static(path.join(__dirname, '/style')));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();
console.log(appEnv);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

//----------------------------------------------------------------------------------------

var watson = require('watson-developer-cloud');

//credenciais de acesso ao serviço do Watson Conversation
var conversation = watson.conversation({
  username:'6f8b8ad7-c4b1-4c59-ac56-034744df982d',//substitua pelo username do seu serviço
  password:'BHiRNqxo8EXH',//substitua pelo password do seu serviço
  version: 'v1',
  version_date: '2016-07-11'
});


//Worskpace ID a ser mudado pelo seu Conversation
var workspace = '271654e5-008e-486e-9242-c294be080bdc';


app.post('/converse', function(req, res, next) {
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };
  
  if (req.body) {
    if ( req.body.input ) {
      payload.input = {text: req.body.input};
    }
    if (req.body.context) {
      payload.context = req.body.context;
    }
  }else{
    payload = {};
      }
  conversation.message(payload, function(err, data){
    if ( err ) {
      console.log(err);
    }else{

      // if(!data.output.text[0]){
      //   data.output.text[0] = resposta[data.intents[0].intent];
      // }
      return res.json(data);
    }
  });

});




//------------------------------------------------------------------------------------
// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});