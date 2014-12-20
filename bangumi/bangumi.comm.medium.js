﻿
/*

更新历史

12-16: 初版，直接从完成的代码块中提取
12-17: 初步封装
12-18: 封装完成，加入注释，增加安全性（12-19：失效，不要乱用）
12-19: 测试完成，修正大量 bug。做到了与原 BangumiCore() API 兼容。

*/

function BangumiCommMedium()
{
	var DOJO_SRC = "http://ajax.googleapis.com/ajax/libs/dojo/1.10.3/dojo/dojo.js";

	// @param url: 请求的 URL。注意，不包含GET请求后接的内容（如“?key=value”）。
	// @param meth: 请求的发起方法，POST或者GET。
	// @param getData: 键值对。将会被作为GET的URL内容传递。
	// @param postData: 键值对。键和值都必须是元类型。将会被作为POST的表内容传递。
	// @param targetWindow: 要被触发 onmessage 事件的窗口。注意如果窗口的 onmessage 事件处理函数无效，则无法返回任何信息。
	// @returns: 请看 doTransmission() 方法的说明。
	// @example: var bcm = new BangumiCommMedium();
	// 		   	 window.onmessage = function (m) { console.info(m); };
	// 		   	 bcm.comm("http://api.bgm.tv/auth", "POST", {source: "onAir"}, {username:"uname", password:"pword"}, window);
	// @remarks: 必须要在目标域中运行该函数，才能正常输出。例如，该函数在 http://api.bgm.tv 页面发起 Bangumi API 请求。
	// 		     实现的方式很简单。(1) 新建一个<iframe>，其 src 属性设置为目标域下的一个页面。(2) 在该<iframe>内运行该函数（利用 GreaseMonkey 的加载运行机制），并返回传递给 window.parent.window。
	//			 针对 Bangumi API，可以使用 apibase+apiname 的方式，例如 apibase="http://api.bgm.tv", apiname="/auth"
	this.comm = function (url, meth, getData, postData, targetWindow)
	{
		
		// <form>元素
		var xfe = null;
		
		function appendForm(postData)
		{
			xfe = document.createElement("form");
			// 隐藏表单
			xfe.style.display = "none";
			var tempElem;
			for (var key in postData)
			{
				// 由于整张表都是不可见的所以就不需要用<input type="password">了
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
			for (var key in postData)
			{
				sr += encodeURIComponent(key.toString()) + "=" + encodeURIComponent(postData[key].toString()) + "&";
			}
			if (sr.length > 0)
			{
				sr = sr.substring(0, sr.length - 1);
				sr = "?" + sr;
			}
			return sr;
		}

		// 这一段代码改自 Dojo 的官方示例
		// @returns:
		// 正常情况下是一段 JSON 数据
		// 发生错误的情况下返回 { errinfo: errobj }
		// 如果调用参数错误返回 null
		// @remarks: 在目标窗口接收到消息的时候，该对象会映射到 msg.data 属性的值。
		function doTransmission()
		{
			// FIXIT: 以下这一行代码在 FireFox 下无法工作
			require(["dojo/request/iframe"], function (iframe)
			{
				// 不知道为何默认的method参数不能用，于是我用了这种别扭的方法
				var fcall = meth.toLowerCase() == "post" ? iframe.post : meth.toLowerCase() == "get" ? iframe.get : null;
				if (fcall != null)
				{
					var trueUrl = url;
					trueUrl += buildGetString(getData);
					fcall(trueUrl, {
						// 尽管官方说返回 JSON/文本的时候要放在<textField>中，但是实测 handleAs = "XML" 也是可以的，跳过以上限制，此时返回 JSON 文本
						handleAs: "xml",
						form: meth.toLowerCase() == "post" ? xfe : undefined,
						// 不知道 Dojo 的 form 参数如果是字符串应该是怎么取，似乎现在只能构造一个 <form>
						//form: buildPostString(formData),
						//method: meth
					}).then(function (jsondoc)
					{
						// 收到数据（JSON 格式），解析为 JSON 对象
						var jsonobj = eval("(" + jsondoc.toString() + ")");
						console.log("Data received:");
						console.info(jsonobj);
						// 将发送方的origin限制为当前窗口的，为了安全起见。在接收的时候一定要判明（查看收到的对象的origin属性）。本例中应用在 http://api.bgm.tv，则origin就是这个值。
						targetWindow.postMessage(jsonobj, "*");
						xfe.parentNode.removeChild(xfe);
					}, function (err)
					{
						// 调用过程中发生了错误
						console.log("An error occured:");
						console.info(err);
						// 将发送方的origin限制为当前窗口的，为了安全起见。在接收的时候一定要判明（查看收到的对象的origin属性）。本例中应用在 http://api.bgm.tv，则origin就是这个值。
						targetWindow.postMessage({errinfo: err}, "*");
						xfe.parentNode.removeChild(xfe);
					});
				}
				else
				{
					// 参数错误（非 POST/GET）
					// 将发送方的origin限制为当前窗口的，为了安全起见。在接收的时候一定要判明（查看收到的对象的origin属性）。本例中应用在 http://api.bgm.tv，则origin就是这个值。
					targetWindow.postMessage(null, "*");
					xfe.parentNode.removeChild(xfe);
				}
			});
		}

		// 等待脚本加载完成，然后执行指定的函数
		// @param url: 脚本文件的 URL
		// @param fn: 回调函数，签名为 function fn () {...}
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
		
		/** 运行开始 **/
		appendForm(postData);
		// GreaseMonkey 无法正确解析对 Dojo 的 @require，所以还是得要动态加载
		waitForScript(DOJO_SRC, doTransmission);
	}
}