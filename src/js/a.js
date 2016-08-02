// 初始化标签页
function initTab(){
	$$('.tabs').each(function(){
		// 页面列表
		var page = document.getElementById(this.data('page'));
		this.$$('a').each(function(){
			this.on('click', function(){
				// 页面ID
				var cur = this.data('page');
				
				var tab = this;
				
				page.$$('.p').each(function(){
					this.style.display = 'none';
					document.getElementById(cur).style.display = 'block';
				});
				this.parentNode.$$('a').each(function(){
					this.rmclass('on');
					tab.addclass('on');
				});
			});
		});
		
		// 初始化
		this.$$('.on').each(function(){
			page.$$('#' + this.data('page')).each(function(){
				this.style.display = 'block';
			});
		});
	});
}

// 提示
function toast(s){
	var t = document.getElementById('toast');
	t.textContent = s;
	t.style.display = 'block';
	t.style.left = (document.documentElement.clientWidth - t.offsetWidth) / 2 + 'px';
	setTimeout(function(){
		t.style.display = null;
	}, 3000);
}

// 加载用户信息
function loadUserinfo(){
	if(localStorage.accesstoken){
		ajax({
			method: 'POST',
			url: '/user/getinfo',
			data: {
				token: localStorage.accesstoken
			}
		}, function(data, status){
			if(status == 200){
				try{
					var json = JSON.parse(data);
				}catch(e){
					toast('解析数据错误');
					return;
				}
				
				if(!json.error){
					// 获取成功
					$$('#avatar').each(function(){
						this.src = '/image/head' + json.user.headimg.toString() + '.jpg';
					});
					$$('#level').each(function(){
						this.textContent = 'Lv. ' + json.user.level.toString();
					});
					$$('#nickname').each(function(){
						this.textContent = json.user.nickname;
					});
					$$('#usercup').each(function(){
						this.textContent = json.user.cup.toString();
					});
					$$('#win').each(function(){
						this.textContent = json.user.game.win.toString();
					});
					$$('#even').each(function(){
						this.textContent = json.user.game.even.toString();
					});
					$$('#lose').each(function(){
						this.textContent = json.user.game.lose.toString();
					});
				}else{
					toast('获取用户信息失败');
				}
			}else{
				toast('服务器请求失败');
			}
		});
	}
}

// 更新token
function updateToken(){
	if(localStorage.accesstoken){
		ajax({
			method: 'POST',
			url: '/account/token/update',
			data: {
				token: localStorage.accesstoken
			}
		}, function(data, status){
			if(status == 200){
				try{
					var json = JSON.parse(data);
				}catch(e){
					toast('解析数据错误');
					return;
				}
				
				if(!json.error){
					// 授权码有效  更新授权码
					toast('授权码更新成功');
				}else{
					toast('更新授权码失效，请重新登录');
				}
			}else{
				toast('服务器请求失败');
			}
		});
	}
}

// 验证token
function verificate(){
	if(localStorage.accesstoken){
		ajax({
			method: 'POST',
			url: '/account/token/verificate',
			data: {
				token: localStorage.accesstoken
			}
		}, function(data, status){
			if(status == 200){
				try{
					var json = JSON.parse(data);
				}catch(e){
					toast('解析数据错误');
					return;
				}
				
				if(!json.error){
					// 授权码有效  更新授权码
					updateToken();
					
					// 进入游戏界面
					$$('#main_page').each(function(){
						this.style.display = 'block';
					});
					$$('#start_page').each(function(){
						this.style.display = 'none';
					});
				}else{
					toast('授权码失效，请重新登录');
				}
			}else{
				toast('服务器请求失败');
			}
		});
	}
}

// 初始化
function init(){
	// 首页登录和注册按钮切换
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
	
	// 返回按钮
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
	
	// 注册按钮
	$$('#regbtn').each(function(){
		this.on('click', function(){
			var user = $$('#reg_user')[0].value.trim();
			var pwd = $$('#reg_pwd')[0].value;
			var pwd2 = $$('#reg_pwd2')[0].value;
			
			if(pwd != pwd2){
				// 两次输入的密码不一致
				toast('两次输入的密码不一致');
				return;
			}
			
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
						toast('解析数据错误');
						return;
					}
					
					if(!json.error){
						GAME.uid = json.uid;
						toast('注册成功，请登录');
					}else{
						toast('注册失败，用户可能已存在');
					}
				}else{
					toast('服务器请求失败');
				}
			})
		});
	});
	
	// 登录按钮
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
						toast('解析数据错误');
						return;
					}
					
					if(!json.error){
						localStorage.accesstoken = json.token;
						$$('#login_page').each(function(){
							this.style.display = 'none';
						});
						$$('#main_page').each(function(){
							this.style.display = 'block';
						});
					}else{
						toast('用户不存在或密码错误');
					}
				}else{
					toast('服务器请求失败');
				}
			})
		});
	});
}

// get deck list
function getdecklist(){
	if(localStorage.accesstoken){
		ajax({
			method: 'POST',
			url: '/deck/getlist',
			data: {
				token: localStorage.accesstoken
			}
		}, function(data, status){
			if(status == 200){
				try{
					var json = JSON.parse(data);
				}catch(e){
					toast('解析数据错误');
					return;
				}
				
				if(!json.error){
					// 授权码有效  更新授权码
					var deck = json.deck;
					
					$$('#decklist').each(function(){
						this.innerHTML = '';
						for(var i = 0; i < deck.length; i++){
							if(deck[i].onBattle){
								this.innerHTML += '<div>\
							<a href="javascript:;" class="delete" data-id="'+deck[i].id+'">删除</a>\
							<a href="javascript:;" class="seton off" data-id="'+deck[i].id+'">出战</a>\
							<a href="javascript:;" class="title">'+deck[i].title+'</a>\
						</div>';
							}else{
								this.innerHTML += '<div>\
							<a href="javascript:;" class="delete" data-id="'+deck[i].id+'">删除</a>\
							<a href="javascript:;" class="seton" data-id="'+deck[i].id+'">出战</a>\
							<a href="javascript:;" class="title">'+deck[i].title+'</a>\
						</div>';
							}
						}
					});
				}else{
					toast('获取列表失败');
				}
			}else{
				toast('服务器请求失败');
			}
		});
	}
}

document.ready(function(){
	window.GAME = {};
	verificate();
	init();
	initTab();
	
	// 获取用户信息
	$$('#user_tab').each(function(){
		this.on('click', function(){
			loadUserinfo();
		});
	});
	
	// get deck list
	$$('#deck_tab').each(function(){
		this.on('click', function(){
			getdecklist();
		});
	});
});