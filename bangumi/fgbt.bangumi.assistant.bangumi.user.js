// ==UserScript==
// @id             fgbt.bangumi.assistant.bangumi
// @name           FGBT Bangumi Assistant (@Bangumi)
// @version        0.1.5 (beta)
// @namespace      https://github.com/GridScience
// @author         micstu@FGBT
// @description    ������δ����԰ҳ��ͨ�ŵ� Bangumi ҳ�������
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_addStyle
// @grant          GM_setClipboard
// @grant          GM_openInTab
// @grant          GM_xmlhttpRequest
// @grant          GM_registerMenuCommand
// @grant          GM_deleteValue
// jQuery����ʱû�õ���
// require        http://code.jquery.com/jquery-2.1.1.min.js
// Dojo Framework��������Ч��
// require        http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js
// ���� GM 1.x, 2.x����ʱû�ã�
// require        https://greasyfork.org/scripts/2599/code/gm2_port_v102.js

// @include        http://api.bgm.tv/*
// run-at         document-end

// @reference      BangumiCore by jabbany@GitHub
// @reference      SimplePanel in BaiduPanDownloadHelper by ywzhaiqi@gmail.com
// @reference      Dojo example by The Dojo Foundation
// ==/UserScript==

// Bangumi Communication Medium
var bcm;

function BangumiCommMedium()
{
	var DOJO_SRC = "http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js";

	// @param url: ����� URL��ע�⣬������GET�����ӵ����ݣ��硰?key=value������
	// @param meth: ����ķ��𷽷���POST����GET��
	// @param postData: ��ֵ�ԡ�����ֵ��������Ԫ���͡����ᱻ��ΪPOST�ı����ݴ��ݡ�
	// @param getData: ��ֵ�ԡ����ᱻ��ΪGET��URL���ݴ��ݡ�
	// @param targetWindow: Ҫ������ onmessage �¼��Ĵ��ڡ�ע��������ڵ� onmessage �¼���������Ч�����޷������κ���Ϣ��
	// @returns: �뿴 doTransmission() ������˵����
	// @example: var bcm = new BangumiCommMedium();
	// 		   	 window.onmessage = function (m) { console.info(m); };
	// 		   	 bcm.comm("http://api.bgm.tv/auth", "POST", {username:"uname", password:"pword"}, {source: "onAir"}, window);
	// @remarks: ����Ҫ��Ŀ���������иú���������������������磬�ú����� http://api.bgm.tv ҳ�淢�� Bangumi API ����
	// 		     ʵ�ֵķ�ʽ�ܼ򵥡�(1) �½�һ��<iframe>���� src ��������ΪĿ�����µ�һ��ҳ�档(2) �ڸ�<iframe>�����иú��������� GreaseMonkey �ļ������л��ƣ��������ش��ݸ� window.parent.window��
	//			 ��� Bangumi API������ʹ�� apibase+apiname �ķ�ʽ������ apibase="http://api.bgm.tv", apiname="/auth"
	this.comm = function (url, meth, postData, getData, targetWindow)
	{
		
		// <form>Ԫ��
		var xfe = null;
		
		function appendForm(postData)
		{
			xfe = document.createElement("form");
			// ���ر�
			xfe.style.display = "none";
			var tempElem;
			for (var key in postData)
			{
				// �������ű��ǲ��ɼ������ԾͲ���Ҫ��<input type="password">��
				tempElem = document.createElement("input");
				tempElem.type = "text";
				tempElem.name = tempElem.id = key;
				tempElem.value = postData[key].toString();
				xfe.appendChild(tempElem);
			}
			document.body.appendChild(xfe);
		}
		
		/*
		function buildPostString(postData)
		{
			var sr = "";
			for (var key in postData)
			{
				sr += encodeURIComponent(key.toString()) + "=" + encodeURIComponent(postData[key].toString()) + "&";
			}
			if (sr.length > 0)
			{
				sr = sr.substring(0, sr.length - 1);
			}
			//console.log(sr);
			return sr;
		}
		*/
		
		function buildGetString(getData)
		{
			var sr = "";
			for (var key in getData)
			{
				sr += encodeURIComponent(key.toString()) + "=" + encodeURIComponent(getData[key].toString()) + "&";
			}
			if (sr.length > 0)
			{
				sr = sr.substring(0, sr.length - 1);
				sr = "?" + sr;
			}
			return sr;
		}

		// ��һ�δ������ Dojo �Ĺٷ�ʾ��
		// @returns:
		// �����������һ�� JSON ����
		// �������������·��� { errinfo: errobj }
		// ������ò������󷵻� null
		// @remarks: ��Ŀ�괰�ڽ��յ���Ϣ��ʱ�򣬸ö����ӳ�䵽 msg.data ���Ե�ֵ��
		function doTransmission()
		{
			// FIXIT: ������һ�д����� FireFox ���޷�����
			require(["dojo/request/iframe"], function (iframe)
			{
				// ��֪��Ϊ��Ĭ�ϵ�method���������ã��������������ֱ�Ť�ķ���
				var fcall = meth.toLowerCase() == "post" ? iframe.post : meth.toLowerCase() == "get" ? iframe.get : null;
				if (fcall != null)
				{
					var trueUrl = url;
					trueUrl += buildGetString(getData);
					console.log("url = " + trueUrl);
					fcall(trueUrl, {
						// ���ܹٷ�˵���� JSON/�ı���ʱ��Ҫ����<textField>�У�����ʵ�� handleAs = "XML" Ҳ�ǿ��Եģ������������ƣ���ʱ���� JSON �ı�
						handleAs: "xml",
						form: meth.toLowerCase() == "post" ? xfe : undefined,
						// ��֪�� Dojo �� form ����������ַ���Ӧ������ôȡ���ƺ�����ֻ�ܹ���һ�� <form>
						//form: buildPostString(formData),
						//method: meth
					}).then(function (jsondoc)
					{
						// �յ����ݣ�JSON ��ʽ��������Ϊ JSON ����
						console.log("JSON: " + jsondoc);
						//var jsonobj = JSON.parse(jsondoc);
						var jsonobj = eval("(" + jsondoc.toString() + ")");
						console.log("Data received:");
						console.info(jsonobj);
						// �����ͷ���origin����Ϊ��ǰ���ڵģ�Ϊ�˰�ȫ������ڽ��յ�ʱ��һ��Ҫ�������鿴�յ��Ķ����origin���ԣ���������Ӧ���� http://api.bgm.tv����origin�������ֵ��
						targetWindow.postMessage(jsonobj, "*");
						xfe.parentNode.removeChild(xfe);
					}, function (err)
					{
						// ���ù����з����˴���
						console.log("An error occured:");
						console.info(err);
						// �����ͷ���origin����Ϊ��ǰ���ڵģ�Ϊ�˰�ȫ������ڽ��յ�ʱ��һ��Ҫ�������鿴�յ��Ķ����origin���ԣ���������Ӧ���� http://api.bgm.tv����origin�������ֵ��
						targetWindow.postMessage({errinfo: err}, "*");
						xfe.parentNode.removeChild(xfe);
					});
				}
				else
				{
					// �������󣨷� POST/GET��
					// �����ͷ���origin����Ϊ��ǰ���ڵģ�Ϊ�˰�ȫ������ڽ��յ�ʱ��һ��Ҫ�������鿴�յ��Ķ����origin���ԣ���������Ӧ���� http://api.bgm.tv����origin�������ֵ��
					targetWindow.postMessage(null, "*");
					xfe.parentNode.removeChild(xfe);
				}
			});
		}

		// �ȴ��ű�������ɣ�Ȼ��ִ��ָ���ĺ���
		// @param url: �ű��ļ��� URL
		// @param fn: �ص�������ǩ��Ϊ function fn () {...}
		function waitForScript(url, fn)
		{
			var script = document.createElement("script");
			script.type = "text/javascript";
			// MSIE
			if (script.readyState)
			{
				script.onreadystatechange = function ()
				{
					if (script.readyState == "loaded" || script.readyState == "complete")
					{
						script.onreadystatechange = null;
						fn instanceof Function && fn();
						script.parentNode.removeChild(script);
					}
				};
			}
			else
			{
				script.onload = function ()
				{
					fn instanceof Function && fn();
					script.parentNode.removeChild(script);
				}
			}
			script.src = url;
			//document.getElementsByTagName("head")[0].appendChild(script);
			document.head.appendChild(script);
		}
		
		/** ���п�ʼ **/
		appendForm(postData);
		// GreaseMonkey �޷���ȷ������ Dojo �� @require�����Ի��ǵ�Ҫ��̬����
		waitForScript(DOJO_SRC, doTransmission);
	}
}

function window_OnMessage(msg)
{
	// this.comm = function (url, meth, getData, postData, targetWindow)
	// ����������Ϣ��ʽ��
	/*
	{
		_url: apiRoot + url,
		_needsAuth: needsAuth,
		_post: post,
		_get: get,
		_auth: auth,
	};
	*/
	// if (msg.origin == $BUAABT) �ж��Ƿ������Ϣ����������ȫ
	var data = msg.data;
	
	if (data._needsAuth)
	{
		data._get["auth"] = data._auth_auth;
		data._get["sysusername"] = data._auth_username;
		data._get["sysuid"] = data._auth_id;
	}
	var meth = data._post == undefined || data._post == null ? "GET" : "POST";
	
	// ����������Ϣ
	bcm.comm(data._url, meth, data._post, data._get, window.parent.window);
}

bcm = new BangumiCommMedium();
window.onmessage = window_OnMessage;