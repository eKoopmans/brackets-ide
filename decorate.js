/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout, $, document, alert */

define(function (require, exports, module) {
    "use strict";
    var DocumentManager = brackets.getModule("document/DocumentManager");
        
    
    var curOpenDir,
        curOpenFile,
        curOpenLang;

    function make_gutter() {
        var cm = DocumentManager.getCurrentDocument()._masterEditor._codeMirror;
        var hasGutter = false;
        var i, n;
        for (i = 0, n = cm.getOption('gutters'); i < n.length; i++) {
            hasGutter = hasGutter || n[i] === 'compiler-gutter';
        }
        if (!hasGutter) {
            cm.setOption('gutters', ["compiler-gutter"].concat(cm.getOption('gutters')));
        }
    }

    function add_line_errors(line, msg) {
        //pastLineErrors.push(line);
        var dm = DocumentManager.getCurrentDocument()._masterEditor;
        var cm = dm._codeMirror;
        var e = document.createElement('span');
        e.appendChild(document.createTextNode("●●●"));
        e.style.color = "red";
        e.style.size = 18;
        e.style.textAlign = "right";
        e.title = msg;
        cm.setGutterMarker(line, "compiler-gutter", e);
        cm.addLineClass(line, "background", "line-bg-error");
        cm.addLineClass(line, "text", "line-text-error");
        cm.refresh();
        setTimeout(function () {
            $('.line-text-error').attr('title', msg);
        }, 500);
        //('.line-text-error').onchange(function() { });
    }
    
    function reset(lastErrors) {
        
        if (lastErrors[curOpenFile]) {
            var pastLineErrors = lastErrors[curOpenFile];
            var cm = DocumentManager.getCurrentDocument()._masterEditor._codeMirror;
            cm.clearGutter("compiler-gutter");
            $('.line-text-error').attr('title', '');
            while (pastLineErrors.length > 0) {
                var cur = pastLineErrors.pop();
                cm.removeLineClass(cur.line, "background");
                cm.removeLineClass(cur.line, "text");
            }
        }
        
    }
    
    function setCurrentFile() {
        curOpenDir = DocumentManager.getCurrentDocument().file._parentPath;
        curOpenFile = DocumentManager.getCurrentDocument().file._path;
        curOpenLang = DocumentManager.getCurrentDocument().language._name;
    }
    
    function add_errors_to_file(lastErrors) {
        setCurrentFile();
        /*if (file !== curOpenFile) {
            console.log("filtered out error not pertaining to file");
            return;
        }*/

        // Set Gutter
        make_gutter();

        // decorate current file
        var i,
            n = lastErrors[curOpenFile];
        for (i = 0; n && i < n.length; i++) {
            add_line_errors(n[i].line, n[i].error);
        }
    }

    module.exports = {
        setCurrentFile: setCurrentFile,
        add_errors_to_file: add_errors_to_file,
        reset: reset
    };
});