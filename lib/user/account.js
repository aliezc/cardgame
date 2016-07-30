'use strict';

var assert = require('assert');
var mongo = require('mongodb').MongoClient;
var qs = require('querystring');
var config = require('../const.json');
var redis = require('redis');
var util = require('./util.js');

var ACCOUNT = {
	// 创建新用户
	create : function(options, cb){
		mongo.connect(config.mongodb, function(err, db){
			assert.equal(err, null);
			
			var user = db.collection('user');
			user.find({user: options.user}).count(function(err, cnt){
				assert.equal(null, err);
				
				if(cnt){
					// 用户已存在
					cb.call(null, new Error('Username exists'));
					db.close();
					return;
				}else{
					// 构造用户数据
					var udata = {
						// 用户名
						user: options.user,
						
						// 密码
						pwd: require('crypto').createHash('sha1').update(options.pwd).digest('hex'),
						
						// 卡牌碎片
						cardpeace: 0,
						
						// 用户状态
						status: 1,
						
						// 拥有的卡包
						cardpack: {
							// 基础随机卡包
							base: 5,
							
							// 基础功能卡包
							baseFeatures: 2,
							
							// 基础随从卡包
							baseRetinue: 3
						},
						
						// 拥有的卡牌
						cards: [{
							// id
							cid: 'C5ad7fa87f5128',
							
							// 模板
							model: '1212741284',
							
							// 猜拳
							mora: 0
						}, {
							// id
							cid: 'C5ad7fa8sf5128',
							
							// 模板
							model: '1212741284',
							
							// 猜拳
							mora: 2
						}]
						
						// 卡组
						deck: [{
							// 卡组名
							name: '疯狗流',
							
							// 卡牌列表
							cards: ['C5ad7fa87f5128', 'C5ad7fa8sf5128'],
							
							// 是否为出战卡组
							onBattle: true
						}]
					};
					user.insertOne(udata, function(err, result){
						assert.equal(null, err);
						
						db.close();
						
						if(result.result.ok){
							// 插入成功
							cb.call(null, null, result.insertedId);
							return;
						}else{
							// 插入成功
							cb.call(null, new Error('Insert fail'));
							return;
						}
					});
				}
			});
		});
	},
	
	// 登录
	login : function(options, cb){
		mongo.connect(config.mongodb, function(err, db){
			assert.equal(null, err);
			
			var user = db.collection('user');
			user.find({user: options.user}).toArray(function(err, arr){
				assert.equal(null, err);
				
				if(arr.length){
					var pwd = require('crypto').createHash('sha1').update(options.pwd).digest('hex');
					
					var userdata = arr[i];
					if(userdata.pwd == pwd){
						// 生成授权码
						var ao = util.generateAccessCode(userdata);
						
						db.close();
						cb.call(null, null, ao);
						return;
					}else{
						// 密码错误
						db.close();
						
						cb.call(null, new Error('Bad password'));
						return;
					}
				}else{
					// 用户不存在
					db.close();
					
					cb.call(null, new Error('User doesnt exists'));
					return;
				}
			});
		});
	}
}

module.exports = {
	registry: function(req, res){
		var buf = new Buffer('');
		req.on('data', function(chunk){
			buf = Buffer.concat([buf, chunk]);
		}).on('end', function(){
			res.setHeader('content-type', 'application/json');
			
			try{
				var arg = qs.parse(buf.toString());
			}catch(e){
				res.end(JSON.stringify({
					code: 1001,
					error: 'Invalid arguments'
				}));
				return;
			}
			
			if(arg.user && arg.pwd){
				ACCOUNT.create(arg, function(err, id){
					if(err){
						res.end(JSON.stringify({
							code: 1002,
							error: err.message
						}));
						return;
					}
					
					res.end(JSON.stringify({
						code: 0,
						error: 'Registry success'
					}));
				});
			}else{
				res.end(JSON.stringify({
					code: 1001,
					error: 'Invalid arguments'
				}));
				return;
			}
		});
	},
	
	signin : function(req, res){
		var buf = new Buffer('');
		req.on('data', function(chunk){
			buf = Buffer.concat([buf, chunk]);
		}).on('end', function(){
			res.setHeader('content-type', 'application/json');
			
			try{
				var arg = qs.parse(buf.toString());
			}catch(e){
				res.end(JSON.stringify({
					code: 1001,
					error: 'Invalid arguments'
				}));
				return;
			}
			
			if(arg.user && arg.pwd){
				ACCOUNT.login(arg, function(err, ao){
					if(err){
						res.end(JSON.stringify({
							code: 1002,
							error: err.message
						}));
						return;
					}
					
					var r = redis.createClient();
					r.on('error', function(err){
						console.log(err);
						res.end(JSON.stringify({
							code: 1003,
							error: err.message
						}));
						return;
					});
					
					r.set(ao.accesscode, JSON.stringify({
						id: ao.id,
						expires: ao.expires,
						createtime: ao.createtime
					}));
					
					r.close();
					
					res.end(JSON.stringify({
						code: 0,
						error: 'Registry success'
					}));
				});
			}else{
				res.end(JSON.stringify({
					code: 1001,
					error: 'Invalid arguments'
				}));
				return;
			}
		});
	}
}