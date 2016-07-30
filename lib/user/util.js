'use strict';

module.exports = {
	// 生成授权码
	generateAccessCode : function(info){
		var timestamp = Date.now();
		var arr = [info._id, info.user, info.pwd, timestamp.toString()];
		arr.sort();
		var s = arr.join();
		return {
			accesscode: 'AC' + require('crypto').createHash('sha1').update(s).digest('hex'),
			createtime: timestamp,
			expires: 21600000,
			id: info._id
		};
	}
}