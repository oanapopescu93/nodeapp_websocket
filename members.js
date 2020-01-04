var express = require("express");
var router01 = express.Router();

var user;
var pass = "nothing";

router01.get('/members/:user', function(req, res, next){
  console.log('members, router01', req.params.user, pass);
  res.render('websocket_members', {layout: 'layout.hbs', template: 'members-template', output: req.params.user});
});

router01.post('/members/submit', function(req, res, next) {
	user = req.body.user; 
	pass = req.body.pass;
	res.redirect('/members/'+user);
});

module.exports = router01;