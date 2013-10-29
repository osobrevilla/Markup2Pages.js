(function (window, document, undefined) {

    Markup2Pages = function (html, options) {
        var p;
        this.options = {
            height: 600,
            width: 450,
            pageClass: ''
        };
        for (p in options)
            this.options[p] = options[p];
        this.el = document.createElement('div');
        this.el.innerHTML = html;
        this.page = null;
        this.pages = [];
    };


    Markup2Pages.prototype = {

        constructor: Markup2Pages,

        _toWordNodes: function (node) {
            var frag = document.createDocumentFragment(),
                words = node.textContent.split(/([\s])+/),
                len = words.length,
                i = 0,
                tn = document.createTextNode("");

            for (; i < len; i++) {
                var el = tn.cloneNode(true);
                el.textContent = words[i];
                frag.appendChild(el);
            }
            return frag;
        },

        _browser: function (source, target, oParent) {

            if (source.hasChildNodes()) {

                for (var cloned, node = source.firstChild; node; node = node.nextSibling) {

                    switch (node.nodeType) {
                        case window.Node.ELEMENT_NODE:
                            cloned = node.cloneNode(false);
                            target.appendChild(cloned);
                            if (node.hasChildNodes())
                                this._browser(node, cloned);
                            break;
                        case window.Node.TEXT_NODE:
                            target.appendChild(cloned = node.cloneNode(false));
                            break;
                    }

                    if (this._isOverflow()) {

                        if (cloned.parentNode)
                            cloned.parentNode.removeChild(cloned);

                        switch (node.nodeType) {
                            case window.Node.ELEMENT_NODE:
                                if (node.hasChildNodes()) {
                                    this._browser(node, target)
                                } else {
                                    this._newPage();
                                    this.page.appendChild(cloned);
                                    target = cloned.parentNode;
                                }
                                break;
                            case window.Node.TEXT_NODE:
    
                                var words = this._toWordNodes(node);
    
                                if (words.childNodes.length > 1) {
                                    var first = words.childNodes.item(0);
                                    node.parentNode.replaceChild(words, node);
                                    node = first;
                                } else {
                                    this._newPage();
                                    var pNode = node.parentNode.cloneNode(false);
                                    pNode.appendChild(node.cloneNode(false));
                                    this.page.appendChild(pNode);
                                    target = pNode;
                                }
                                break;
                        }
                    }

                }

            }

        },

        _isOverflow: function () {
            return this.page.clientHeight > this.options.height;
        },

        _createCalcPage: function () {
            this.page = document.createElement('div');
            this._css(this.page, {
                visibility: 'hidden',
                width: this.options.width + 'px'
            });
            this.page.className = this.options.pageClass;
            document.body.appendChild(this.page);
            return this.page;
        },

        _savePage: function () {
            this.pages.push(this._css(this.page.cloneNode(true), {
                position: '',
                left: '',
                visibility: ''
            }));
        },

        _newPage: function () {
            if (this.page) {
                this._savePage();
                this._cleanCalcPage();
            }
        },

        _cleanCalcPage: function () {
            this.page.innerHTML = "";
        },

        generate: function (callback) {
            setTimeout(function () {
                this._browser(this.el, this._createCalcPage());
                if (this.page.hasChildNodes())
                    this._newPage();
                if (this.page.parentNode)
                    this.page.parentNode.removeChild(this.page);
                callback && callback(this.pages);
            }.bind(this), 25);
        },

        _css: function (el, styles) {
            var s;
            for (s in styles)
                el.style[s] = styles[s];
            return el;
        }
    };

}(window, document));
