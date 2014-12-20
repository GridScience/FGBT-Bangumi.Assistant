/** BangumiCore, cross domain **/
// @param targetWindow: 将要接收此处发出的消息的窗口
function BangumiCoreXD(targetWindow)
{
	var auth = null;
	var apiRoot = "http://api.bgm.tv";
	var apiOrigin = apiRoot;
	
	// Cross domain API request
	var xdapi = function (url, needsAuth, post, get, callback)
	{
		//pack up
		var packedData;
		packedData = 
		{
			_url: apiRoot + url,
			_needsAuth: needsAuth,
			//_post: post,
			//_get: get,
			//_auth: auth,
		};
		packedData._get = {};
		for (var xg in get)
		{
			packedData._get[xg] = get[xg];
		}
		packedData._post = {};
		for (var xp in post)
		{
			packedData._post[xp] = post[xp];
		}
		if (packedData._get == undefined || packedData._get == null)
		{
			packedData._get = {source: "onAir"};
		}
		else
		{
			// 必须设置项
			packedData._get["source"] = "onAir";
		}
		if (auth != null)
		{
			packedData._auth_auth = auth.auth;
			packedData._auth_username = auth.username;
			packedData._auth_id = auth.id;
		}
		
		//var originalOnMessage = window.onmessage;
		window.onmessage = function (msg)
		{
			var obj = msg.data;
			var orig = msg.origin;
			if (msg.origin == apiOrigin)
			{
				if (obj != null)
				{
					if (obj.errinfo != undefined)
					{
						// 一般错误
						console.info(obj.errinfo);
					}
					else
					{
						// 成功
						callback(obj);
					}
				}
				else
				{
					// method参数错误
					console.log("method 参数错误。");
				}
			}
			// 记住重置 window.onmessage
			// 12-19: 不能重置！否则会引发对undefined调用apply()错误
			//window.onmessage = originalOnMessage;
		}
		targetWindow.postMessage(packedData, "http://api.bgm.tv");
	}
	
	this.authenticate = function (user, pass, callback)
	{
		function authCallback(jsonobj)
		{
			auth = jsonobj;
			callback();
		}
		
		xdapi("/auth", false, { username: user, password: pass }, null, authCallback);
	}
	
	this.api = xdapi;
	
	this.getToken = function ()
	{
		return auth == null ? null : auth.auth;
	}
	
	this.getUID = function ()
	{
		return auth == null ? -1 : auth.id;
	}
	
	// 提供 getLogin() 向 BangumiCore 兼容
	this.getLogin = this.getUserName = function ()
	{
		return auth == null ? "" : auth.username;
	}
	
	this.getNickname = function ()
	{
		return auth == null ? "" : auth.nickname;
	}
	
	this.getSignature = function ()
	{
		return auth == null ? "" : auth.sign;
	}
	
	// @param size: "small" "medium" "large" "grid"
	this.getAvatar = function (size)
	{
		return auth == null ? null : size == null ? auth.avatar["large"] : auth.avatar[size];
	}
	
	this.saveAuth = function ()
	{
		// Save the authentication data
	}
	
	this.loadAuth = function ()
	{
		// Load the authentication data
	}
	
	this.clearAuth = function ()
	{
		// Clear the authentication data
	}
}