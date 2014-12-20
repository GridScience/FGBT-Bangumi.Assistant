// 本脚本用来动态连接注入 Bangumi API 页面的脚本内容位置
function injectFromFgbtToBangumi(iframe)
{
	var scriptText;
	var scriptSrc;
	// 这里输入 Bangumi 端的代码源
	scriptSrc = "https://raw.githubusercontent.com/GridScience/FGBT-Bangumi.Assistant/master/bangumi/fgbt.bangumi.assistant.bangumi.user.js";
	// 这里输入 Bangumi 端的代码
	scriptText = 'var scnode = script.createElement("script"); scnode.src = "' + scriptSrc + '"; document.head.append(scnode);';
	iframe.contentWindow.eval(scriptText);
}