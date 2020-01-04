var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next){
	console.log("Hello friend");
	res.render('websocket', {layout: 'layout.hbs', template: 'home-template'});
});

module.exports = router;