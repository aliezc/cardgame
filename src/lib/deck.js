var db = require('./db.js');
var assert = require('assert');
var util = require('./util.js');

// generate deck id
function genDeckID(user, pwd, title){
    return require('crypto').createHash('md5').update(user + pwd + title + Date.now().toString()).digest('hdx');
}

// 创建卡组
function createDeck(t, title, cb){
	assert(typeof t == 'string');
	assert(typeof title == 'string');
	assert(typeof cb == 'function');
	
	if(title.trim().length > 10){
	    // title too long
	    cb.call(null);
	}
	
	db.find('user', {accesstoken: t}, function(arr){
	    if(arr.length){
	        var u = arr[0];
	        var id = genDeckID(u.user, u.pwd, title.trim());
	        var deck = {
	        	id: id,
	        	title: title.trim(),
	        	cards: [],
	        	createTime: Date.now(),
	        	onBattle: false
	        };
	        if(u.deck.length < 5){
	        	// user decks limit 5
	        	u.deck.push(deck);
	        	
	        	db.update('user', {accesstoken: t}, u, function(obj){
	        		if(obj){
	        			// update success
	        			cb.call(null, deck);
	        		}else{
	        			// update fail
	        			cb.call(null);
	        		}
	        	});
	        }else{
	        	cb.call(null);
	        }
	    }else{
	        // accesstoken失效
	        cb.call(null);
	    }
	});
}

// get list
function getList(t, cb){
	assert(typeof t == 'string');
	assert(typeof cb == 'function');
	
	db.find('user', {accesstoken: t}, function(arr){
		if(arr.length){
			cb.call(null, arr[0].deck);
		}else{
			// accesstoken fail
			cb.call(null);
		}
	});
}

module.exports = {
	create: function(req, res){
		if(req.method != 'POST'){
			util.sendObj.call(res, {
				error: 2001,
				message: 'Invalid request method'
			});
			return;
		}
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
			
			if(q.token && q.title){
				createDeck(q.token, q.title, function(e){
					if(e){
						util.sendObj.call(res, {
							error: 0,
							deck: {
								id: e.id,
								title: e.title,
								time: e.createTime,
								on: e.onBattle
							}
						});
					}else{
						// create fail
						util.sendObj.call(res, {
							error: 1004,
							message: 'Create fail'
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
	
	getList: function(req, res){
		if(req.method != 'POST'){
			util.sendObj.call(res, {
				error: 2001,
				message: 'Invalid request method'
			});
			return;
		}
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
			
			if(q.token){
				getList(q.token, function(e){
					if(e){
						util.sendObj.call(res, {
							error: 0,
							deck: e
						});
					}else{
						// create fail
						util.sendObj.call(res, {
							error: 1004,
							message: 'Get list fail'
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