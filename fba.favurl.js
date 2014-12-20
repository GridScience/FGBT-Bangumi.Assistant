// 用来在浏览器收藏夹启动的轻量级 JavaScript 代码
// 调用方式：
// 1、压缩该脚本；
// 2、收藏夹中加入“javascript: {$SCRIPT}”，其中“{$SCRIPT}”是压缩后的脚本。
// 3、执行。
function do_all()
{
	var fba_fgbt = document.createElement("script");
	var fba_scripton = document.createElement("script");

	function inj_loaded()
	{
		if (fba_fgbt.readystate == undefined || fba_fgbt.readyState == "loaded" || fba_fgbt.readyState == "complete")
		{
			fba_scripton.onreadystatechange = fba_scripton.onload = function ()
			{
				console.log("FGBT-Bangumi Assistant 未来花园端加载完成。");
			};
			fba_scripton.src = "https://raw.githubusercontent.com/GridScience/FGBT-Bangumi.Assistant/master/fgbt/fgbt.bangumi.assistant.fgbt.user.js";
			document.head.appendChild(fba_fgbt);
		}
	}
	
	fba_fgbt.onreadystatechange = fba_fgbt.onload = inj_loaded;
	
	// 先加载用来注入代码至 Bangumi API 页面的代码
	fba_fgbt.src = "https://raw.githubusercontent.com/GridScience/FGBT-Bangumi.Assistant/master/fba.inject.src.js"
	document.head.appendChild(fba_fgbt);
}