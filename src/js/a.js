document.ready(function(){
	window.GAME = {};
	$$('#login').each(function(){
		this.on('click', function(){
			$$('#start_page').each(function(){
				this.style.display = 'none';
			});
			$$('#login_page').each(function(){
				this.style.display = 'block';
			});
		});
	});
	
	$$('#reg').each(function(){
		this.on('click', function(){
			$$('#start_page').each(function(){
				this.style.display = 'none';
			});
			$$('#reg_page').each(function(){
				this.style.display = 'block';
			});
		});
	});
	
	$$('.back-home').each(function(){
		this.on('click', function(){
			$$('#' + this.data('rootid')).each(function(){
				this.style.display = 'none';
			});
			$$('#start_page').each(function(){
				this.style.display = 'block';
			});
		});
	});
	
	$$('#loginbtn').each(function(){
		this.on('click', function(){
			var user = $$('#login_user')[0].value.trim();
			var pwd = $$('#login_pwd')[0].value;
			ajax({
				method: 'POST',
				url: '/account/login',
				data: {
					user: user,
					pwd: pwd
				}
				
			}, function(data, status){
				if(status == 200){
					try{
						var json = JSON.parse(data);
					}catch(e){
						alert('解析数据错误');
						return;
					}
					
					if(!json.error){
						GAME.token = json.token;
						alert('登录成功');
					}else{
						alert(json.message);
					}
				}else{
					alert('服务器请求失败');
				}
			})
		});
	});
	
	$$('#regbtn').each(function(){
		this.on('click', function(){
			var user = $$('#reg_user')[0].value.trim();
			var pwd = $$('#reg_pwd')[0].value;
			ajax({
				method: 'POST',
				url: '/account/register',
				data: {
					user: user,
					pwd: pwd
				}
				
			}, function(data, status){
				if(status == 200){
					try{
						var json = JSON.parse(data);
					}catch(e){
						alert('解析数据错误');
						return;
					}
					
					if(!json.error){
						GAME.uid = json.uid;
						alert('注册成功，请登录');
					}else{
						alert(json.message);
					}
				}else{
					alert('服务器请求失败');
				}
			})
		});
	});
});