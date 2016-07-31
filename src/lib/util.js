var http = require('http');
var assert = require('assert');
var fs = require('fs');
var mime = require('mimez');

function sendObj(o, code, headers){
	assert(this instanceof http.ServerResponse);
	
	this.statusCode = code || 200;
	if(headers){
		for(var i in headers){
			this.setHeader(i, headers[i]);
		}
	}
	this.setHeader('content-type', 'application/json');
	
	this.end(JSON.stringify(o));
}

/*
 * 发送文件   ps:压缩和断点续传交给Nginx做反向代理
 * @param {http.ServerResponse} 响应对象
 * @param {string} 文件地址
 */
function sendFile(res, file){
    assert(res instanceof http.ServerResponse);
    assert.equal('string', typeof file);

    try{
        var frs = fs.createReadStream(file);

        frs.on('error', function(err){
            // 读取文件出错
            res.statusCode = 404;
            res.end();
        });

        res.statusCode = 200;
        res.setHeader("content-type", mime.path(file));

        frs.pipe(res);
    }catch(e){
        // 读取文件出错
        res.statusCode = 404;
        res.end();
    }
}


/*
 * 渲染页面
 * @param {http.ServerResponse} 响应对象
 * @param {string} 模板文件
 * @param {object} 参数
 */
function render(res, view, args){
    assert(res instanceof http.ServerResponse);
    assert.equal('string', typeof view);
    assert.equal('object', typeof args);

    fs.readFile(view, function(err, buf){
        assert.equal(null, err);

        // 转换成字符串并消除换行
        var template = buf.toString().replace(/>\s*</mg, '><');

        for(var i in args){
            var reg = new RegExp('\\{\\$' + i + '\\}', 'g');
            template = template.replace(reg, args[i]);
        }

        res.statusCode = 200;
        res.setHeader("content-type", "text/html");
        res.end(template);
    });
}

module.exports = {
	sendObj : sendObj,
	sendFile: sendFile,
	render: render
}