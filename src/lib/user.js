var db = require('./db.js');
var assert = require('assert');
var util = require('./util.js');

// 创建用户
function createUser(info, cb){
	assert(info.user);
	assert(info.pwd);
	assert('function' == typeof cb);
	
	var userinfo = {
		user: info.user,					// 用户名
		// 密码
		pwd: require('crypto').createHash('sha1').update(info.pwd).digest('hex'),
		
		// 游戏得分记录
		gameRecord: {
			win: 0,			//胜利
			even: 0,		//平手
			lose: 0			//失败
		},
		regtime: Date.now(),	// 注册时间
		nickname: info.nickname || null,	// 昵称，如果不存在则显示用户名
		cardpack: {			// 玩家拥有的卡包
			base: 8			// 基础卡包，注册送8个
		},
		cards: [],			// 玩家拥有的卡牌
		deck: [],			// 玩家编制的卡组
		status: 1,			// 帐号状态
		accesstoken: null	// 授权状态
	}
	
	db.insertExists('user', {user: info.user}, userinfo, function(res){
		if(res){
			// 插入成功返回新用户的id
			cb.call(null, res.insertedId);
		}else{
			// 插入失败说明用户名可能已存在
			cb.call(null);
		}
	});
}

// 生成登录授权码
function getAccessToken(d){
	return require('crypto').createHash('sha1').update(([d._id, d.user, d.pwd, Date.now().toString()]).join()).digest('hex');
}

// 验证登录信息
function verificateUser(info, cb){
	assert(info.user);
	assert(info.pwd);
	assert('function' == typeof cb);
	
	db.find('user', {user: info.user}, function(arr){
		if(arr){
			var u = arr[0];
			var p = require('crypto').createHash('sha1').update(info.pwd).digest('hex');
			if(u.pwd == p){
				u.accesstoken = getAccessToken(u)
				u.accesstime = Date.now();
				
				db.update('user', {user: u.user}, u, function(n){
					if(n){
						if('function' == typeof cb) cb.call(null, u.accesstoken);
						return;
					}else{
						// 更新失败
						if('function' == typeof cb) cb.call(null);
						return;
					}
				});
			}else{
				// 密码错误
				if('function' == typeof cb) cb.call(null);
				return;
			}
		}else{
			// 用户不存在
			if('function' == typeof cb) cb.call(null);
			return;
		}
	});
}

module.exports = {
	createUser: function(req, res){
		var b = new Buffer('');
		req.on('data', function(chunk){
			b = Buffer.concat([b, chunk]);
		}).on('end', function(){
			try{
				var q = require('querystring').parse(b.toString());
			}catch(e){
				util.sendObj.call(res, {
					error: 1001,
					message: 'Invalid arguments'
				}, 200);
				return;
			}
			
			if(q.user && q.pwd){
				createUser(q, function(id){
					if(id){
						util.sendObj.call(res, {
							error: 0,
							uid: id
						});
					}else{
						// 创建失败
						util.sendObj.call(res, {
							error: 1002,
							message: 'Create fail maybe username exists'
						}, 200);
					}
				});
			}else{
				util.sendObj.call(res, {
					error: 1001,
					message: 'Invalid arguments'
				}, 200);
				return;
			}
		});
	},
	verificateUser: function(req, res){
		var b = new Buffer('');
		req.on('data', function(chunk){
			b = Buffer.concat([b, chunk]);
		}).on('end', function(){
			try{
				var q = require('querystring').parse(b.toString());
			}catch(e){
				util.sendObj.call(res, {
					error: 1001,
					message: 'Invalid arguments'
				}, 200);
				return;
			}
			
			if(q.user && q.pwd){
				verificateUser(q, function(at){
					if(at){
						util.sendObj.call(res, {
							error: 0,
							token: at
						}, 200, {
							"set-cookie": "CSESID=" + at + ";path=/;httponly"
						});
					}else{
						// 验证失败
						util.sendObj.call(res, {
							error: 1003,
							message: 'User doesn\'t exists or bad password'
						}, 200);
					}
				});
			}else{
				util.sendObj.call(res, {
					error: 1001,
					message: 'Invalid arguments'
				}, 200);
				return;
			}
		});
	}
}