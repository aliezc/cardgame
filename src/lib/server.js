var user = require('./user.js');
var util = require('./util.js');
var deck = require('./deck.js');

module.exports = [
	// 注册
{
	matcher: /^\/account\/register$/,
	handle: user.createUser
},
	// 登录
{
	matcher: /^\/account\/login$/,
	handle: user.verificateUser
},
	// 验证token
{
	matcher: /^\/account\/token\/verificate$/,
	handle: user.verificateToken
},
	// 刷新token
{
	matcher: /^\/account\/token\/update$/,
	handle: user.updateToken
},

	// get user info
{
	matcher: /^\/user\/getinfo$/,
	handle: user.getUserinfo
},

	// create deck
{
	matcher: /^\/deck\/create$/,
	handle: deck.create
},

	// get deck list
{
	matcher: /^\/deck\/getlist$/,
	handle: deck.getList
},

	// 图标
{
	matcher: '/favicon.ico',
	handle: function(req, res){
		util.sendFile(res, './favicon.ico');
	}
},

	// 静态CSS文件
{
	matcher: /^\/css\/.*/,
	handle: function(req, res){
		var file = require('path').join('./css', require('url').parse(req.url).pathname.match(/^\/css\/(.*)/)[1]);
		util.sendFile(res, file);
	}
},

	// 静态图片文件
{
	matcher: /^\/image\/.*/,
	handle: function(req, res){
		var file = require('path').join('./image', require('url').parse(req.url).pathname.match(/^\/image\/(.*)/)[1]);
		util.sendFile(res, file);
	}
},

	// 静态js文件
{
	matcher: /^\/js\/.*/,
	handle: function(req, res){
		var file = require('path').join('./js', require('url').parse(req.url).pathname.match(/^\/js\/(.*)/)[1]);
		util.sendFile(res, file);
	}
},

	// 游戏主页
{
	matcher: '/game',
	handle: function(req, res){
		util.render(res, './html/game.htm', {
			title: '天天卡牌 - 一直在测试的测试服',
			game_title: '天天卡牌'
		});
	}
}];