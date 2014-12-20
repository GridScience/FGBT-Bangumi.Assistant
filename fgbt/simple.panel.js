function SimplePanel()
{
	if (!panelLoaded)
	{
		this.init.apply(this, arguments);
		panelLoaded = true;
	}
}

SimplePanel.prototype = {
    constructor: SimplePanel,
    toString: function() {
        return "[object SimplePanel]";
    },
	contentLoaded: Boolean,

    init: function (namespace, doc) {
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
        var getId = function (id) {
            return self.panel.querySelector('#' + self.namespace + '_' + id);
        };

        this.closeButton = getId('closeButton');
        this.batchedlink = getId('batchedlink');

        this.closeButton.onclick = function () {
            self.hide();
        };
    },
    destory: function() {
        this.panel.parentNode.reomveChild(this.panel);
    },
    /*show: function (text) {
        this.batchedlink.innerHTML = text;
        this.panel.style.display = 'block';

        //this.select();
    },*/
    show: function () {
        this.panel.style.display = 'block';

        //this.select();
    },
	setElement: function (element)
	{
		if (!this.contentLoaded)
		{
			this.batchedlink.insertBefore(element, null);
			this.contentLoaded = true;
		}
	},
    hide: function () {
        this.panel.style.display = 'none';
    },
    select: function () {  // 高亮选中文本
        var selection = this.win.getSelection();
        var range = this.doc.createRange();
        range.selectNodeContents(this.batchedlink);
        selection.removeAllRanges();
        selection.addRange(range);
    },
    html: function () {
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
        }.toString().match(/\/\*([\s\S]+)\*\//)[1],
    css: function () {
        /*
         #{namespace}_batchedPublish {
             position: fixed;
             z-index: 1001;
             top: 30%;
             left: 30%;
             width: 530px;
             background: white;
             border: 3px solid #AAA;
         }
         #{namespace}_batchedlink {
             height: 250px;
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
        }.toString().match(/\/\*([\s\S]+)\*\//)[1],
};