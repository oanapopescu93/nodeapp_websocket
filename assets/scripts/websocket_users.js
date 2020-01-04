'use strict'

var wsUri = "ws://localhost:3000";
var socket = new WebSocket(wsUri);
var username = $('#username').text();
console.log('members page', username);

var options = {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', };

$('#chatform').submit(function(e){
	e.preventDefault(); 
	
	var today  = new Date();
	
	var obj = {chat_name: username, chat_message: $('#chattext').val(), chat_date:today.toLocaleDateString("en-US", options)};
	send_obj(obj);
	
	$('#chattext').val('');
	return false;
});

socket.onopen = function (){
	var today  = new Date();
	var obj = {username: username, user_date:today.toLocaleDateString("en-US", options)};
	send_obj(obj);
}

socket.onerror = function(error) {
  console.log(`WebSocket error: ${error}`)
}

socket.onclose = function() {
	
};

socket.onmessage = function(e) {	
	console.log('server says: ', e.data)
	
	if(e.data.includes('username":')){
		var data = JSON.parse(e.data);
		$('#user_list ul').empty();
		for(var i in data){
			$('#user_list ul').append('<li><span>'+ data[i].username +'</span><span class="turn_right">'+ data[i].user_date +'</span></li>');
		} 
	} else if(e.data.includes('chat_message":')){
		var data = JSON.parse(e.data);
		$('#chatmessages').append('<p><span>'+ data.chat_name +': </span><span>'+ data.chat_message +'</span><span class="turn_right">'+ data.chat_date +'</span></p>')
	} else {
		alert(e.data);
	}
	
}

function send_obj(obj){	
	var text = JSON.stringify(obj);	
	socket.send(text) 
}

function get_date_format(date){
	console.warn('date', date);
	
}