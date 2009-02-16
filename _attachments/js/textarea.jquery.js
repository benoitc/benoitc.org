/*
 * Copyright 2009 (c) Benoît Chesneau <benoitc@e-engura.org>
 *
 */


(function($) {

    $.fn.TextArea = function(options) {
        options = options || {};

        var defaults = {
            tab_spacing: true,
            tab_char: 4,
            lineHeight: 16,
            change_callback: null        
        };

        var options = $.extend(defaults, options);
        return this.each(function() {
            new TextArea(this, options);
        });
    }

    function TextArea(el, options) {
        return this instanceof TextArea
        ? this.init(el, options)
        : TextArea(el, opttions);
    }

    $.extend(TextArea.prototype, {

        init: function(el, options) {
            this.el = $(el);
            this.preview = $(options.preview);

            this.element = this.el[0];
            this.options = options;
            this._change_callback = options.change_callback;

            this.bindMethodsToObj("handleKey");

            // detection of browser for webkit
            var ua = navigator.userAgent.toLowerCase();
            this.isWebkit = (ua.indexOf('webkit') >= 0);
            this.isChrome = (ua.indexOf('chrome') >= 0);
            this.isOpera = (ua.indexOf('opera') >= 0);

            this.lastSelection = {};

            // we need to add one character for webkit
            if (this.isWebkit)
                this.options.tab_char += 1;
            
            if (this.options.tab_spacing) {
                this.tabulation = "";
                for (var i=0; i<this.options.tab_char; i++)
                    this.tabulation += " ";
            } else {
                this.tabulation = "\t";
            }

            this.tab_detected = false;

            // init selection for ie
            if (typeof this.element.selectionStart == 'undefined')
                this.element.selectionStart = this.element.selectionEnd = 0;

            this.el.keydown(this.handleKey);

            var self = this;
            this.change_callback = function() {
                if (self._change_callback) {
                    self._change_callback(self.element.value);
                }
                return;
            }
            this.change_callback();  
            this.el.keyup(this.change_callback);
            this.el.bind('paste', this.change_callback);
            this.el.bind('input', this.change_callback);
        },

        handleKey: function(e) {
            c = e.keyCode;
            if (c == 9) {
                e.preventDefault();
                this.tab_selection();
                e.returnValue = false;
                e.stopPropagation();
                return false;
            } else if (c == 13) {
                if (this.do_enter()) {
                    e.preventDefault();
                    e.returnValue = false;
                    e.stopPropagation();
                    return false;
                }
            }
            return true;
        }, 

        tab_selection: function() {
            if (this._is_tabbing)
                return

            this._is_tabbing = true;
            
            if (!!document.selection)
                this._getIESelection();

            if (!this._tab_detected)
                this._detect_tab(); 

            var start = this.element.selectionStart;
            var end = this.element.selectionEnd;
            var insText = this.element.value.substring(start, end);
            var scrollTop = this.el.scrollTop();
            var scrollLeft = this.el.scrollLeft();
           
            var pos_start=start;
		    var pos_end=end;
            if (insText.length == 0) {
			    // if only one line selected
			    this.element.value = this.element.value.substr(0, start) + 
                    this.tabulation + this.element.value.substr(end);
			    pos_start = start + this.tabulation.length;
			    pos_end = pos_start;
		    } else {
			    start = Math.max(0, this.element.value.substr(0, start).lastIndexOf("\n") + 1);
			    endText = this.element.value.substr(end);
			    startText = this.element;value.substr(0, start);
			    tmp = insText.split("\n");
			    insText = this.tabulation+tmp.join("\n"+this.tabulation);
			    this.el.val(startText + insText + endText);
			    pos_start = start;
			    pos_end = this.element.value.indexOf("\n", startText.length + insText.length);
                if (pos_end == -1)
			    	pos_end = this.element.value.length;
		    }
		    this.element.selectionStart = pos_start;
		    this.element.selectionEnd = pos_end;

            if (!!document.selection) {
                this._setIESelection();
                setTimeout(function(){ self._is_tabbing=false; }, 100);
                this._is_tabbing = false;
            } else {
                this._is_tabbing = false;
            }

            this.el.scrollTop(scrollTop);
            this.el.scrollLeft(scrollLeft);
        },

        do_enter: function() {
            if (!!document.selection) 
                this._getIESelection();

            var scrollTop = this.el.scrollTop();
            var scrollLeft = this.el.scrollLeft();

            var start = this.element.selectionStart;
            var end = this.element.selectionEnd;

            var start_last_line = Math.max(0, 
                    this.element.value.substring(0, start).lastIndexOf("\n") + 1 );
           
            var latest_line = this.element.value.substring(start_last_line,
                    start)

            if (latest_line.match(/^[ \t]+$/mg,""))
                return false;

            var begin_line= latest_line.replace(/^([ \t]*).*/gm, "$1");
            if (begin_line == "\n" || begin_line == "\r") 
                return false;

            if (!!document.selection || this.isOpera) {
                begin_line = "\r\n" + begin_line;
            } else {
                begin_line = "\n" + begin_line;
            }
            this.element.value = this.element.value.substring(0, start) +
                begin_line + this.element.value.substring(end);
            
            this.area_select(start + begin_line.length, 0);

            this.el.scrollTop(scrollTop); 
            this.el.scrollLeft(scrollLeft);

            return true;
        },

        area_select: function(start, length){
            var value = this.el.val();
            start = Math.max(0, Math.min(value.length, start));
            end = Math.max(start, Math.min(value.length, start+length));

            if (!!document.selection) {
                this.element.selectionStart = start;
                this.element;selectionEnd = end;		
                this._setIESelection();
            } else {
                if (this.isOpera) {
                    this.element.setSelectionRange(0, 0);
                }
                this.element.setSelectionRange(start, end);
            }
        },

        _detect_tab: function() {
            if (this.element.value.indexOf("\t") > 0) {
                this.tabulation = "\t";
            } else {
                this.tabulation =  "";
                for(var i=0; i<this.options.tab_char; i++)
                    this.tabulation += " ";
            }
            this._tab_detected = true;
        },

        _getIESelection: function() {
            alert("mmm");
            this.el.focus();
            var start_range = this.elelement.createTextRange();
            var end_range = start_range.duplicate();
            start_range.moveToBookmark(document.selection.createRange().getBookmark());
            start_range.moveEnd('character', this.element.value.length);
            this.el.selectionStart = this.element.value.length - start_range.text.length;
            end_range.moveToBookmark(document.selection.createRange().getBookmark());
            end_range.moveStart('character', - this.element.value.length);
            this.el.selectionEnd = end_range.text.length;
            if (this.element.selectionEnd < this.element.selectionStart)
                this.element.selectionEnd = this.element.selectionStart;
            
        },
        
        _setIESelection: function() {
            var nbLineStart = this.element.value.substr(0,
                    this.element.selectionStart).split("\n").length - 1;
            var nbLineEnd = this.element.value.substr(0,
                    this.element.selectionEnd).split("\n").length - 1;
            var range = document.selection.createRange();
            range.moveToElementText( this.element );
            range.setEndPoint( 'EndToStart', range );
            range.collapse(true);	
            range.moveStart('character', this.element.selectionStart - nbLineStart);
            range.moveEnd('character', 
                    this.element.selectionEnd - nbLineEnd - 
                    (this.element.selectionStart - nbLineStart)  );
            
            range.select();
        },

        bindToObj: function(fn) {
            var self = this;
            return function() { return fn.apply(self, arguments) };
        },

        bindMethodsToObj: function() {
            for (var i = 0; i < arguments.length; i++) {
                this[arguments[i]] = this.bindToObj(this[arguments[i]]);
            };
        }

    });

})(jQuery);

