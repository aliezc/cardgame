var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var config = require('../config.json');

// 查找记录
function find(c, s, cb){
	assert('string' == typeof c);
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).find(s).toArray(function(err, arr){
			assert(err == null);
			db.close();
			if(typeof cb == 'function') cb.call(null, arr);
		});
	});
}

// 插入一条记录
function insert(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).insertOne(s, function(err, res){
			assert(err == null);
			db.close();
			
			if(res.result.ok){
				if('function' == typeof cb) cb.call(null);
			}else{
				if('function' == typeof cb) cb.call(null, res);
			}
		});
	});
}

// 插入多条记录
function inserts(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).insert(s, function(err, res){
			assert(err == null);
			db.close();
			
			if(res.result.ok){
				if('function' == typeof cb) cb.call(null);
			}else{
				if('function' == typeof cb) cb.call(null, res);
			}
		});
	});
}

// 查找是否存在记录
function exists(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).find(s).count(function(err, cnt){
			assert(err == null);
			db.close();
			
			if(typeof cb == 'function') cb.call(null, cnt && true || false);
		});
	});
}

// 如果条件不存在则插入记录
function insertExists(c, s1, s2, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).find(s1).count(function(err, cnt){
			assert(err == null);
			
			if(!cnt){
				db.collection(c).insertOne(s2, function(err, res){
					assert(err == null);
					db.close();
					
					if(res.result.ok){
						if(typeof cb == 'function') cb.call(null, res);
					}else{
						if(typeof cb == 'function') cb.call(null);
					}
				});
			}else{
				db.close();
				if(typeof cb == 'function') cb.call(null);
			}
		});
	});
}

// 查找一条记录并更新
function update(c, s1, s2, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).findOneAndUpdate(s1, s2, function(err, res){
			assert(err == null);
			db.close();
			
			if(res.ok){
				if('function' == typeof cb) cb.call(null, res.value);
			}else{
				if('function' == typeof cb) cb.call(null);
			}
		});
	});
}

module.exports = {
	find: find,
	insert: insert,
	inserts: inserts,
	exists: exists,
	insertExists: insertExists,
	update: update
}