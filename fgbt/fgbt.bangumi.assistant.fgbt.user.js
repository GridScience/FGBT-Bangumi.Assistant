// ==UserScript==
// @id             fgbt.bangumi.assistant.fgbt
// @name           FGBT Bangumi Assistant (@FGBT)
// @version        0.1.0 (beta, Chrome Only)
// @namespace      https://github.com/GridScience
// @author         micstu@FGBT
// @description    在未来花园动漫版的资源页面引入 Bangumi 记录功能。
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @grant          GM_setClipboard
// @grant          GM_openInTab
// @grant          GM_xmlhttpRequest
// @grant          GM_registerMenuCommand
// @grant          GM_deleteValue
// jQuery（暂时没用到）
// require        http://code.jquery.com/jquery-2.1.1.min.js
// Dojo Framework（引用无效）
// require        http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js
// 兼容 GM 1.x, 2.x（暂时没用）
// require        https://greasyfork.org/scripts/2599/code/gm2_port_v102.js

// @include        http*://buaabt.cn/*
// @include        http*://ipv4.buaabt.cn/*
// @include        http*://bt.buaa6.edu.cn/*
// run-at         document-end

// @reference      BangumiCore by jabbany@GitHub
// @reference      SimplePanel in BaiduPanDownloadHelper by ywzhaiqi@gmail.com
// @reference      Dojo example by The Dojo Foundation
// ==/UserScript==

// 内置页面
var panel = null;
// BangumiCore XD
var bc = null;
// 与 Bangumi 交互的<iframe>元素
var iframe = null;
// 内置页面下的表单，是各种控件的实际容器
// 例如通过 bgm["username"] 访问用户名<input>，bgm["password"] 访问密码<input>
var bangumiPage = null;
// 我们采用是单实例的 SimplePanel()，用这个变量防止重复 init()
var panelLoaded = false;

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


function SimplePanel(namespace, doc)
{
	var contentLoaded;
	
    this.toString = function ()
	{
        return "[object SimplePanel]";
    };

    this.init = function (namespace, doc)
	{
		this.contentLoaded = false;
        this.doc = doc || document;
        this.win = this.doc.defaultView;
        this.namespace = namespace || 'GM';

        this.html = this.html.replace(/\{namespace\}/g, this.namespace);
        this.css = this.css.replace(/\{namespace\}/g, this.namespace);

        var div = this.doc.createElement('div');
        div.setAttribute('id', this.namespace + '_panel');
        div.innerHTML = this.html;
        div.style.display = 'none';
        this.doc.body.appendChild(div);
        this.panel = div;

        var style = this.doc.createElement('style');
        style.textContent = this.css;
        this.doc.head.appendChild(style);

        var self = this;
        var getId = function (id)
			{
				return self.panel.querySelector('#' + self.namespace + '_' + id);
			};

        this.closeButton = getId('closeButton');
        this.batchedlink = getId('batchedlink');

        this.closeButton.onclick = function ()
			{
				self.hide();
			};
    };
	
    this.destory = function ()
	{
        this.panel.parentNode.reomveChild(this.panel);
    };
	
    this.show = function ()
	{
        this.panel.style.display = 'block';
    };
	
	this.setElement = function (element)
	{
		if (!this.contentLoaded)
		{
			this.batchedlink.insertBefore(element, null);
			this.contentLoaded = true;
		}
	};
	
    this.hide = function ()
	{
        this.panel.style.display = 'none';
    };
	
    this.selected = function ()
	{  // 高亮选中文本
        var selection = this.win.getSelection();
        var range = this.doc.createRange();
        range.selectNodeContents(this.batchedlink);
        selection.removeAllRanges();
        selection.addRange(range);
    };
	
    this.html = function ()
	{
	/*
	 <div id="{namespace}_batchedPublish">
		 <div id="{namespace}_batchHeader">
			 <a id="{namespace}_closeButton" class="aui_close" href="javascript:;">×</a>
		 </div>
		 <div id="{namespace}_batchedContent">
			 <pre id="{namespace}_batchedlink"></pre>
		 </div>
	 </div>
	 */
	}.toString().match(/\/\*([\s\S]+)\*\//)[1];
		
    this.css = function ()
	{
        /*
         #{namespace}_batchedPublish {
             position: fixed;
             z-index: 1001;
             top: 30%;
             left: 30%;
             width: 540px;
			 height: 80px;
             background: white;
             border: 3px solid #AAA;
         }
         #{namespace}_batchedlink {
             height: 80px;
             overflow: scroll;
         }
         .aui_close {
            width: 20px;
            height: 20px;
            line-height: 20px;
            right: -10px;
            top: -10px;
            border-radius: 20px;
            background: none repeat scroll 0% 0% #778B9D;
            color: #FFF;
            box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3);
            transition: all 0.06s linear 0s;
        }
        .aui_close {
            display: block;
            position: absolute;
            padding: 0px;
            text-align: center;
            font-family: Helvetica,STHeiti;
            font-size: 18px;
            text-decoration: none;
        }
        .aui_close:hover{
            width:24px;
            height:24px;
            line-height:24px;
            right:-12px;
            top:-12px;
            color:#FFF;
            box-shadow:0 1px 3px rgba(209,40,42,.5);
            background:#d1282a;
            border-radius:24px;
        }
        .aui_close:hover,.aui_close:active{
            text-decoration:none;
            color:#900;
         }
         */
	 }.toString().match(/\/\*([\s\S]+)\*\//)[1];
		
	this.init(namespace, doc);
}

function buildBangumiPage()
{
	var lbl;
	
	bangumiPage = document.createElement("form");
    
	/** 登录界面 **/
    var loginPara;
    loginPara = document.createElement("p");
    var loginForm = document.createElement("form");
    bangumiPage.insertBefore(loginPara, null);
    loginPara.insertBefore(loginForm, null);
    loginForm.id = "bangumi_login_form_id";
    loginForm.name = "bangumi_login_form_name";
    
    var loginBtn = document.createElement("button");
    loginBtn.innerHTML = "从 Bangumi 获取信息";
    loginBtn.type = "button";
    loginBtn.name = "login_btn";
    loginBtn.id = "login_btn_id";
    var txtUsername = document.createElement("input");
    txtUsername.type = "text";
    txtUsername.name = txtUsername.id = "uname";
    var txtPassword = document.createElement("input");
    txtPassword.type = "password";
    txtPassword.name = txtPassword.id = "pword";
	loginBtn.style.visibility = "hidden";
	
	var un = GM_getValue("bangumi-fgbt.username");
	var pw = GM_getValue("bangumi-fgbt.password");
	if (un != undefined)
	{
		txtUsername.value = un;
	}
	if (pw != undefined)
	{
		txtPassword.value = pw;
	}
    
    lbl = document.createElement("label");
    lbl.for = "uname";
    lbl.innerHTML = "用户名: ";
    loginForm.insertBefore(lbl, null);
    loginForm.insertBefore(txtUsername, null);
    lbl = document.createElement("label");
    lbl.for = "pword";
    lbl.innerHTML = "  密码: ";
    loginForm.insertBefore(lbl, null);
    loginForm.insertBefore(txtPassword, null);
    lbl = document.createElement("label");
    lbl.for = "login_btn_id";
    lbl.innerHTML = "  ";
    loginForm.insertBefore(lbl, null);
    loginForm.insertBefore(loginBtn, null);
	
	loginBtn.onclick = loginBtn_Click;
    
	/** 操作区 **/
    var progPara;
    progPara = document.createElement("p");
    bangumiPage.insertBefore(progPara, null);
	var progForm;
	progForm = document.createElement("form");
	progPara.insertBefore(progForm, null);
	progForm.style.display = "none";
    
	// 关注列表
    var progCombo;
    progCombo = document.createElement("select");
	progCombo.name = progCombo.id = "bangumi_programs";
	lbl = document.createElement("label");
	lbl.for = "bangumi_programs";
	lbl.innerHTML = "关注列表: ";
	progForm.insertBefore(lbl, null);
	progForm.insertBefore(progCombo, null);
	// 注意要设置选中的事件处理函数
	progCombo.onchange = progCombo_Change;
	
	var epsPara;
    epsPara = document.createElement("p");
    bangumiPage.insertBefore(epsPara, null);
	var epsForm;
	epsForm = document.createElement("form");
	epsPara.insertBefore(epsForm, null);
	epsForm.style.display = "none";
	
	// 集数列表
	var epsCombo;
	epsCombo = document.createElement("select");
	epsCombo.name = epsCombo.id = "bangumi_program_eps";
	lbl = document.createElement("label");
	lbl.for = "bangumi_program_eps";
	lbl.innerHTML = "已经/正在/即将放送: ";
	epsForm.insertBefore(lbl, null);
	epsForm.insertBefore(epsCombo, null);
	
	var markWatchedBtn;
	markWatchedBtn = document.createElement("button");
	markWatchedBtn.type = "button";
	markWatchedBtn.innerHTML = "标记为看过";
	markWatchedBtn.name = markWatchedBtn.id = "mark_as_watched";
	lbl = document.createElement("label");
	lbl.for = "mark_as_watched";
	lbl.innerHTML = "  ";
	epsForm.insertBefore(lbl, null);
	epsForm.insertBefore(markWatchedBtn, null);
	
	markWatchedBtn.onclick = markWatchedBtn_Click;
	
	/** 与 Bangumi 交互区 **/
	iframe = document.createElement("iframe");
	iframe.style.display = "none";
	// 等待 Bangumi API 页面加载完成，然后继续加载过程
	if (iframe.readyState)
	{
		iframe.onreadystatechange = function ()
		{
			if (iframe.readyState == "loaded" || iframe.readyState == "complete")
			{
				iframe.onreadystatechange = null;
				finishInitialization();
			}
		};
	}
	else
	{
		iframe.onload = function ()
		{
			finishInitialization();
		}
	}
	bangumiPage.appendChild(iframe);
	iframe.src = "http://api.bgm.tv";
	
	bangumiPage["loginForm"] = loginForm;
	bangumiPage["progForm"] = progForm;
	bangumiPage["epsForm"] = epsForm;
	bangumiPage["loginBtn"] = loginBtn;
	bangumiPage["username"] = txtUsername;
	bangumiPage["password"] = txtPassword;
	bangumiPage["programs"] = progCombo;
	bangumiPage["eps"] = epsCombo;
	
	return bangumiPage;
}

function loginBtn_Click()
{
	GM_setValue("bangumi-fgbt.username", bangumiPage["username"].value);
	GM_setValue("bangumi-fgbt.password", bangumiPage["password"].value);
	if (bc != null)
	{
		bc.authenticate(bangumiPage["username"].value, bangumiPage["password"].value, loginBtn_Click_Callback);
	}
}

function loginBtn_Click_Callback()
{
	if (bc.getUID() > 0)
	{
		// 隐藏登录表单
		bangumiPage["loginForm"].style.display = "none";
		bangumiPage["progForm"].style.display = "block";
		bangumiPage["epsForm"].style.display = "block";
		alert("已经登录: " + bc.getNickname());
	}
	else
	{
		alert("登录失败。");
	}
	
	if (bc.getUID() > 0)
	{
		// 获取追番信息
		bc.api("/user/" + bc.getUID().toString() + "/collection", true, null, {cat: "watching"}, function (obj)
			{
				// 清空下拉框
				bangumiPage["programs"].innerHTML = "";
				if (obj.errinfo == undefined)
				{
					// 加入下拉列表框的元素
					var optitem;
					// 返回番组信息数组
					for (var i = 0; i < obj.length; i++)
					{
						optitem = document.createElement("option");
						bangumiPage["programs"].add(optitem);
						optitem.value = obj[i].subject.id;
						// 显示番组中文名（智能）
						optitem.innerHTML = obj[i].subject.name_cn.length > 0 ? obj[i].subject.name_cn : obj[i].subject.name;
					}
					// 设置默认选中第一项
					if (bangumiPage["programs"].length > 0)
					{
						bangumiPage["programs"].selectedIndex = 0;
						// 之前已经设置了对 progCombo 的 onchange 事件处理，这里可以放心调用
						bangumiPage["programs"].onchange();
					}
				}
			}
		);
	}
}

function progCombo_Change()
{
	var progCombo = bangumiPage["programs"];
	if (progCombo != undefined && progCombo != null)
	{
		if (progCombo.length > 0 && progCombo.selectedIndex >= 0)
		{
			var optitem = progCombo.item(progCombo.selectedIndex);
			// 获取某个番组各话信息
			bc.api("/subject/" + optitem.value.toString(), false, null, {responseGroup: "large"}, function (obj)
			//bc.api("/user/" + bc.getUID().toString() + "/progress", false, null, {"subject%5Fid", optitem.value.toString()}, function (obj)
				{
					// 清空下拉框
					bangumiPage["eps"].innerHTML = "";
					if (obj.errinfo == undefined)
					{
						var optitem;
						var eps = obj.eps;
						for (var i = 0; i < eps.length; i++)
						{
							// 如果不是未放送状态
							if (eps[i].status != "NA")
							{
								optitem = document.createElement("option");
								bangumiPage["eps"].add(optitem);
								optitem.value = eps[i].id;
								// 显示这一话的中文名（智能）
								optitem.innerHTML = (eps[i].name_cn.length > 0 ? eps[i].name_cn : eps[i].name) + " (EP " + eps[i].sort.toString() + ", " + eps[i].airdate.toString() + ")";
							}
						}
						if (bangumiPage["eps"].length > 0)
						{
							bangumiPage["eps"].selectedIndex = 0;
						}
					}
				}
			);
		}
	}
}

function markWatchedBtn_Click()
{
	var epsCombo = bangumiPage["eps"];
	if (epsCombo != undefined && epsCombo != null)
	{
		if (epsCombo.length > 0 && epsCombo.selectedIndex >= 0)
		{
			var optitem = epsCombo.item(epsCombo.selectedIndex);
			// 设置为“看过”状态。这里分离“watched”以供扩展（watched/queue/drop）
			// 另外现在只设置看过选定的这一话，当然也可以改造为设定*看到*选定的这一项，只需要传递一个逗号分隔epid数组即可（为什么不先清空？嗯，Bangumi 的默认行为如此）
			bc.api("/ep/" + optitem.value.toString() + "/status/" + "watched", true, {ep_id: optitem.value.toString()}, null, function (response)
				{
					if (response.code != undefined && response.code == 200)
					{
						// 设置成功
						// 这里在回调函数中回调函数才去对<select>的查询，由于用户切换到新项目到上一个页面加载完成之间也有可能有一些时间，因此对于一些“手快”的用户，这里会出现提示信息不同步
						alert("设置为已看过成功:\r\n"
							  + bangumiPage["programs"].item(bangumiPage["programs"].selectedIndex).textContent + "\r\n"
							  + bangumiPage["eps"].item(bangumiPage["eps"].selectedIndex).textContent
							 );
					}
					else
					{
						alert("设置过程中出现了错误。");
					}
				}
			);
		}
	}
}

/** 主程序 **/
function main()
{
	
	// 是否处在漫版的资源帖中
	var isComicRes = false;
	var dmNav = document.getElementById("nav").children[6];
	// 注意：
	// 在资源搜索区的元素如下
	// 默认
	// <cite class="pageback z" id="visitedforums" onmouseover="$('visitedforums').id = 'visitedforumstmp';this.id = 'visitedforums';showMenu({'ctrlid':this.id, 'pos':'34'});"><a href="/">返回</a></cite>
	// 鼠标移动完毕
	// <cite class="pageback z" id="visitedforums" onmouseover="$('visitedforums').id = 'visitedforumstmp';this.id = 'visitedforums';showMenu({'ctrlid':this.id, 'pos':'34'});"><a href="/">返回</a></cite>
	// 在资源页面的元素如下——
	// 默认
	// <cite class="pageback"><a id="visitedforums" href="showseeds.aspx?type=comic" onmouseover="$('visitedforums').id = 'visitedforumstmp';this.id = 'visitedforums';showMenu({'ctrlid':this.id, 'pos':'34'})" ;="">返回列表</a></cite>
	// 鼠标移动完毕
	// <a id="visitedforums" href="showseeds.aspx?type=video" onmouseover="$('visitedforums').id = 'visitedforumstmp';this.id = 'visitedforums';showMenu({'ctrlid':this.id, 'pos':'34'})" ;="">返回列表</a>
	// 所以要分别判断
	var forumBack = document.getElementsByClassName("pageback");
	isComicRes = dmNav != undefined && dmNav.textContent == "动漫发布区" && forumBack != undefined && forumBack != null && forumBack[0].children[0].textContent == "返回列表";

	if (!isComicRes)
	{
		return 0;
	}
	
	panel = new SimplePanel();
	panel.setElement(buildBangumiPage());
	
	var showPanelButton = document.createElement("button");
	showPanelButton.onclick = function ()
	{
		panel.show();
	}
	showPanelButton.type = "button";
	showPanelButton.innerHTML = "记录到 Bangumi";

	showPanelButton.style = "padding-left:8px;"
	var downloadSeedLink = document.getElementsByClassName("PrivateBTSeedInfoListDownLink")[0].children[1].children[1];
	downloadSeedLink.parentNode.insertBefore(showPanelButton, null);
}

// 这些必须要等到 Bangumi API 页面加载完成之后才能进行
function finishInitialization()
{
	if (bc == undefined || bc == null)
	{
		bc = new BangumiCoreXD(iframe.contentWindow);
		bangumiPage["loginBtn"].style.visibility = "visible";
	}
}

main();