var user = require('./user.js');
var util = require('./util.js');

module.exports = [{
	matcher: /^\/account\/register$/,
	handle: user.createUser
}, {
	matcher: /^\/account\/login$/,
	handle: user.verificateUser
}, {
	matcher: /^\/css\/.*/,
	handle: function(req, res){
		var file = require('path').join('./css', require('url').parse(req.url).pathname.match(/^\/css\/(.*)/)[1]);
		util.sendFile(res, file);
	}
}, {
	matcher: /^\/js\/.*/,
	handle: function(req, res){
		var file = require('path').join('./js', require('url').parse(req.url).pathname.match(/^\/js\/(.*)/)[1]);
		util.sendFile(res, file);
	}
}, {
	matcher: '/game',
	handle: function(req, res){
		util.render(res, './html/game.htm', {
			title: '天天卡牌'
		});
	}
}];