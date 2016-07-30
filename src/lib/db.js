var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var config = require('./config.json');

function find(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).find(s).toArray(function(err, arr){
			assert(err == null);
			
			if(typeof cb == 'function') cb.call(this, arr);
		});
	});
}

function insert(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).insertOne(s, function(err, res){
			assert(err == null);
			
			if(res.result.ok){
				if('function' == typeof cb) cb.call(null);
			}else{
				if('function' == typeof cb) cb.call(null, res);
			}
		});
	});
}

function inserts(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).insert(s, function(err, res){
			assert(err == null);
			
			if(res.result.ok){
				if('function' == typeof cb) cb.call(null);
			}else{
				if('function' == typeof cb) cb.call(null, res);
			}
		});
	});
}

function exists(c, s, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).find(s).count(function(err, cnt){
			assert(err == null);
			
			if(typeof cb == 'function') cb.call(this, cnt && true || false);
		});
	});
}

function insertExists(c, s1, s2, cb){
	mongo.connect(config.mongourl, function(err, db){
		assert(err == null);
		
		db.collection(c).find(s1).count(function(err, cnt){
			assert(err == null);
			
			if(!cnt){
				db.collection(c).insertOne(s2, function(err, res){
					assert(err == null);
					
					if(res.result.ok){
						if(typeof cb == 'function') cb.call(this, res);
					}else{
						if(typeof cb == 'function') cb.call(this);
					}
				});
			}else{
				if(typeof cb == 'function') cb.call(this);
			}
		});
	});
}

module.exports = {
	find: find,
	insert: insert,
	inserts: inserts,
	exists: exists,
	insertExists: insertExists
}