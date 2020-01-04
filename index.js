var express = require("express");
var path = require("path");
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');

var routes = require("./routes");
var router01 = require("./members");

var app = express();
var port = process.env.PORT || 3000;
var http = require('http').createServer(app);
var WebSocket = require('ws');

app.set("port", port);
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/include/', partialsDir: __dirname + '/views/include/partials/'}));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets', express.static('assets'));

app.use(routes);
app.use(router01);

const wss = new WebSocket.Server({ 
	server: http
})

var user_join = [];
var clients = [];
var id = -1;
var text01 = 'The user is offline or does not exist';
var text02 = 'Please type a user ( /w username message )';

wss.on('connection', function connection(ws) {
	console.log('connection');	
	
	ws.on('message', function message(msg) {
		var text = msg;	
		console.warn('text', text, typeof text);
		
		if(text.includes("username")){
			var obj = JSON.parse(text);	
			
			id++
			user_join.push({userId: id, username: obj.username, user_date: obj.user_date});
			countInArray(user_join, obj.username);	
			
			wss.broadcast(JSON.stringify(user_join));
		} else if(text.includes("chat_message")){
			var obj = JSON.parse(text);	
			var chat_message = obj.chat_message;
			
			console.log('chat_message ', chat_message);
			
			if(chat_message.substr(0,3) === '/w '){						
				chat_message = chat_message.substr(3);
				console.log('chat_message1 ', chat_message);
				
				var index = chat_message.indexOf(" ");				
				
				if(index != -1){
					var chat_user_whisper = chat_message.substring(0, index);
					var chat_message_whisper = chat_message.substring(index+1);
					
					var match = false; 					
					for (var i in user_join){
						if(user_join[i].username == chat_user_whisper){	
							match = true;
						}
					}					
					
					if(match){
						obj.chat_message = '(' + chat_user_whisper + ') ' + chat_message_whisper;
						wss.whisper(JSON.stringify(obj), chat_user_whisper, obj.chat_name);
					} else {										
						wss.whisper(text01, '', obj.chat_name);
					}
				} else {
					wss.whisper(text02, '', obj.chat_name);
				}
			} else {				
				wss.broadcast(JSON.stringify(obj));
			}	
		} 
		
	})
})

wss.on('close', function close(code, reason) {
        console.log("Code: "+code);
        console.log('disconnected');
    });

wss.broadcast = function broadcast(msg) {
   console.log('broadcast ', msg);
   wss.clients.forEach(function each(client) {
       client.send(msg);
    });
};

wss.whisper = function whisper(msg, chat_user_whisper, chat_name) {   
   var id01 = 0;
   var id02 = 0;
   var clients = -1;
   
   for(var i in user_join){
	   if(user_join[i].username == chat_name){
		   id01 = i;
	   } else if(user_join[i].username == chat_user_whisper){
		   id02 = i;
	   }
   }
   
   wss.clients.forEach(function each(client) {
	   clients++	   
	   if(clients == id01 || clients == id02){
		   client.send(msg);
	   }       
    });
};

function countInArray(array, username) {
	//count in user_join
    var count = 0;
    for (var i= user_join.length-1; i >=0; i--){
        if (user_join[i].username == username) {
            count++;
			
			if(count == 2){
				user_join.splice(i, 1);
			}
        }
    }
}

http.listen(app.get("port"), 'localhost', function(){
	console.log("Server started on port " + app.get("port") + " on dirname " + __dirname);
});