/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout, $, document, alert */

define(function (require, exports, module) {
    "use strict";
    var DocumentManager = brackets.getModule("document/DocumentManager");


    var curOpenDir,
        curOpenFile,
        curOpenLang;

    function make_gutter() {
        /*
        var cm = DocumentManager.getCurrentDocument()._masterEditor._codeMirror;
        var hasGutter = false;
        var i, n;
        for (i = 0, n = cm.getOption('gutters'); i < n.length; i++) {
            hasGutter = hasGutter || n[i] === 'compiler-gutter';
        }
        if (!hasGutter) {
            cm.setOption('gutters', ["compiler-gutter"].concat(cm.getOption('gutters')));
        }
        */
    }

    function remove_gutter() {
        /*
        var cm = DocumentManager.getCurrentDocument()._masterEditor._codeMirror;
        var opts = [], i, n;
        for (i = 0, n = cm.getOption('gutters'); i < n.length; i++) {
            if (n[i] !== 'compiler-gutter') { opts.push(n[i]); }
        }
        
        cm.setOption('gutters', opts);
        cm.clearGutter("compiler-gutter"); //added
        */
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
        ////cm.setGutterMarker(line, "compiler-gutter", e);
        cm.addLineClass(line, "text", "line-text-error");
        cm.addLineClass(line, "background", "cm-error"); //background  //line-bg-error
       // cm.addLineClass(line, "text", "cm-keyword");
       // cm.addLineClass(line, "text", "CodeMirror-selectedtext");
        
        cm.refresh();
        setTimeout(function () {
            var onClick = function () {
                //cm.removeLineClass(line, "text");
            };
            $('.line-text-error').attr('title', msg);
            $('.line-text-error').one("click", onClick);
        }, 500);
        //('.line-text-error').onchange(function() { });
    }

    function setCurrentFile() {
        curOpenDir = DocumentManager.getCurrentDocument().file._parentPath;
        curOpenFile = DocumentManager.getCurrentDocument().file._path;
        curOpenLang = DocumentManager.getCurrentDocument().language._name;
    }

    function resetFile(lastFileErrors, doc) {
        var cm = doc._masterEditor._codeMirror;
        
        $('.line-text-error').attr('title', '');
        while (lastFileErrors.length > 0) {
            var cur = lastFileErrors.pop();
            cm.removeLineClass(cur.line, "background");
            cm.removeLineClass(cur.line, "text");
        }
    }
    
    function reset(lastErrors) {
        remove_gutter();
        setCurrentFile();
        var docList = DocumentManager.getAllOpenDocuments();
        var i;
        for (i = 0; i < docList.length; i++) {
            var doc = docList[i];
            var file = doc.file._path;
            if (lastErrors[file]) {
                resetFile(lastErrors[file], doc);
            }
        }
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