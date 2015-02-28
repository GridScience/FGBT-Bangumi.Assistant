# 未来花园-Bangumi助手 (FGBT-Bangumi Assistant)

**仅在[北航未来花园PT](http://buaabt.cn)中有效。** (2015年1月，未来花园的BT服务关闭，该 UserScript 脚本已经无处使用。)

建立未来花园动漫版与 Bangumi 之间的联系。通过小界面，可以很容易地将状态同步到 Bangumi。<span style="color-background: black; color: black">没采用任何样式，界面十分难看，请不要吐槽。第一次写 JavaScript，对眼花缭乱的特性应用不熟，也请不要吐槽。</span>

## 使用方法

安装浏览器对应的 UserScript 插件（可能需要重新启动浏览器），添加 `fgbt` 文件夹下的 `fgbt.bangumi.assistant.fgbt.user.js` 和 `bangumi` 文件夹下的 `fgbt.bangumi.assistant.bangumi.user.js`，并重新加载页面。

## 浏览器支持

需要对应 UserScript 插件支持 GreaseMonkey 0.8 以上的 API，及其相应的浏览器版本。

### 测试可用

- [Mozilla Firefox](http://www.firefox.com.cn/download) - [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey)
- [Google Chrome](http://www.google.cn/chrome) - [TamperMonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Maxthon 4](http://www.maxthon.cn) - [ViolentMonkey](http://extension.maxthon.cn/detail/index.php?view_id=1680)

### 待测试

- [Apple Safari](http://www.apple.com/cn/safari) - [NinjaKit](http://www.pimpmysafari.com/items/NinjaKit-GreaseKit-for-Safari)
- [Opera](http://www.opera.com/zh-cn) - [ViolentMonkey](https://addons.opera.com/zh-cn/extensions/details/violent-monkey/?display=zh)
- Microsoft Internet Explorer 6/7 - Trixie / GreaseMonkIE

### 不可用

- [Microsoft Internet Explorer 8+](http://windows.microsoft.com/zh-cn/internet-explorer/download-ie)

## 授权

[MIT License](http://mit-license.org/)

## 致谢

- jabbany 的 [Bangumi API 拆解](https://github.com/jabbany/dhufufu/tree/master/bangumi)，其中的 BangumiCore 示例是我学习 JavaScript 的第一个教材，本脚本中的 BangumiCoreXD 类也是以兼容它的接口为目的而设计的。
- [BaiduPanDownloadHelper](https://github.com/ywzhaiqi/userscript/tree/master/BaiduPanDownloadHelper) 中提供了一个简单 Panel 类，也提供了 UserScript 格式入门。
