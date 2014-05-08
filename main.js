/**
by Jonathan Dunlap

TODO: Run button only shows up for supported file types
TODO: Error lines red background is removed on change
TODO: Error rows in panel when clicked set focus on error line
TODO: Clear errors for files that are in not in active window
**/

/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout, $, document, alert */

define(function (require, exports, module) {
    "use strict";
    var ext_name = "Brackets Compiler Support",
        ext_name_notify = "[[" + ext_name + "]]";
    var AppInit = brackets.getModule("utils/AppInit"),
        CommandManager = brackets.getModule("command/CommandManager"),
        Menus = brackets.getModule("command/Menus"),
        NodeConnection = brackets.getModule("utils/NodeConnection"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        KeyBindingManager = brackets.getModule('command/KeyBindingManager'),
        FileUtils = brackets.getModule("file/FileUtils"),
        PanelManager = brackets.getModule("view/PanelManager"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        nodeConnection = new NodeConnection(),
        domainPath = ExtensionUtils.getModulePath(module) + "domain",
        EditorManager = brackets.getModule("editor/EditorManager"),
        CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
    
    var curOpenDir,
        curOpenFile,
        curOpenLang,
        cmd = '',
        line_reg,
        file_reg,
        err_reg,
        seperator,
        lastErrors = {}; //{fileName:[{line:int,error:string},...], ...}

    var builders = JSON.parse(require('text!builder.json')),
        panel,
        panelHTML = require('text!brackets-builder-panel.html'),
        panelIsVisible = false;

    function _processCmdOutput(data) {
        data = JSON.stringify(data);
        data = data.replace(/\\n/g, '<br />').replace(/\"/g, '').replace(/\\t/g, '');
        return data;
    }
    
    function setPanel(data) {
        if (!data) {
            data = "";
            $('#builder-panel .builder-content').empty();
            panel.hide();
            return;
        }
        if (typeof data === "string") {
            $('#builder-panel .builder-content').html(data);
        } else {
            $('#builder-panel .builder-content').append(data);
        }
        panel.show();
    }
    
    function handle_success(msg) {
        console.log("Success from compiler: " + msg);
        setPanel(_processCmdOutput(msg));
    }
    
    function reset() {
        setPanel("");
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
        lastErrors = {};
    }
    
    function make_gutter() {
        var cm = DocumentManager.getCurrentDocument()._masterEditor._codeMirror;
        var hasGutter = false;
        var i, n;
        for (i = 0, n = cm.getOption('gutters'); i < n.length; i++) { hasGutter = hasGutter || n[i] === 'compiler-gutter'; }
        if (!hasGutter) { cm.setOption('gutters', ["compiler-gutter"].concat(cm.getOption('gutters'))); }
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
    
    function add_errors_to_file() {
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
    
    function setCurrentFile() {
        curOpenDir = DocumentManager.getCurrentDocument().file._parentPath;
        curOpenFile = DocumentManager.getCurrentDocument().file._path;
        curOpenLang = DocumentManager.getCurrentDocument().language._name;
    }
    
    function handle_error(msg) {
        console.log("Fail from compiler: " + msg);
        
        var msgs = msg.split(seperator),
            i,
            name = DocumentManager.getCurrentDocument().file._name,
            files = [];
        
        for (i = 0; i < msgs.length; i++) {
            // filter out errors not in file
            var file = file_reg.exec(msgs[i]),
                line = line_reg.exec(msgs[i]),
                err = err_reg.exec(msgs[i]);
            if (file && line && err) {
                file = file[file.length - 1]; // get last match
                line = +(line[line.length - 1]) - 1;
                err = err[err.length - 1];
               // err = JSON.stringify(err);
                if (!lastErrors[file]) { lastErrors[file] = []; }
                lastErrors[file].push(
                    { line: line, error: err }
                );
                
                add_errors_to_file();
                files.push(file);
            }
        }
        
        
        var txt = "",
            n;
        var onPanelClickMaker = function (filename, line) {
            return function () {
                console.log("Setting doc to " + filename);
                var doc = DocumentManager.getDocumentForPath(filename);
                doc.then(function (doc) {
                    DocumentManager.setCurrentDocument(doc);
                   // setTimeout(function () { // TODO: remove the need for timeout
                        setCurrentFile();
                        add_errors_to_file();
                        
                        // set cursor TODO: non working
                        var dm = DocumentManager.getCurrentDocument()._masterEditor;
                        var cm = dm._codeMirror;
                        cm.setCursor(line);
                   // }, 600);
                }).done();
                //DocumentManager.setCurrentDocument(doc);
            };
        };
        
        for (i = 0; i < files.length; i++) {
            var filename = files[i];
            var o = lastErrors[filename];
            for (n = 0; n < o.length; n++) {
                txt += "<div class='panel_error'>";
                txt += filename + " line " + o[n].line + "<br/>" + _processCmdOutput(o[n].error) + "<br/>";
                txt += "</div>";
                
                var node = $(txt);
                node.on("click", onPanelClickMaker(filename, o[n].line));
                setPanel(node);
            }
        }
    }
    
    function handle() {
        setCurrentFile();
        reset(); // remove past error markers

        nodeConnection.connect(true).fail(function (err) {
            console.error(ext_name_notify + "Cannot connect to node: ", err);
        }).then(function () {
            console.log('Building ' + curOpenLang + ' in ' + curOpenFile + '...\n');

            return nodeConnection.loadDomains([domainPath], true).fail(function (err) {
                console.error(ext_name_notify + " Cannot register domain: ", err);
            });
        }).then(function () {
            builders.forEach(function (el) {
                if (el.name.toLowerCase() === curOpenLang.toLowerCase()) {
                    cmd = el.cmd;
                    line_reg = new RegExp(el.line_reg);
                    file_reg = new RegExp(el.file_reg);
                    err_reg = new RegExp(el.err_reg);
                    seperator = new RegExp(el.seperator);
                }
            });
            var curOpenFileEsc = curOpenFile.replace(" ", "\\ ")
            cmd = cmd.replace("$FILE", curOpenFileEsc); //+'"'
        }).then(function () {
            nodeConnection.domains["builder.execute"].exec(curOpenDir, cmd)
                .fail(handle_error)
                .then(handle_success);
        }).done();
    }

    AppInit.appReady(function () {
        panel = PanelManager.createBottomPanel("brackets-builder-panel", $(panelHTML), 100);
        $('#builder-panel .close').on('click', function () {
            panel.hide();
        });

        CommandManager.register('Run', 'builder.build', handle);

        KeyBindingManager.addBinding('builder.build', 'Ctrl-Alt-B');

        // Add menu item to edit .json file
        var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);

        menu.addMenuDivider();
        // Create menu item that opens the config .json-file
        CommandManager.register("Edit Builder", 'builder.open-conf', function () {
            Dialogs.showModalDialog('', 'Brackets Builder Extention', 'You must restart Brackets after changing this file.');
            var src = FileUtils.getNativeModuleDirectoryPath(module) + "/builder.json";

            DocumentManager.getDocumentForPath(src).done(
                function (doc) {
                    DocumentManager.setCurrentDocument(doc);
                }
            );
        });

        menu.addMenuItem('builder.open-conf');
        menu.addMenuItem('builder.build');
        
        $("#main-toolbar div.buttons").append("<a href='#' id='Toolbar-Debug-And-Run' title='Run'>Run</a>").on("click", handle);
        
        // Load panel css
        ExtensionUtils.loadStyleSheet(module, "brackets-builder.css");
       
        
    });

});