/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout, $, document, alert */

define(function (require, exports, module) {
    "use strict";
    var PanelManager = brackets.getModule("view/PanelManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        decorate = require("decorate");

    var panel,
        panelHTML = require('text!brackets-builder-panel.html'),
        panelIsVisible = false;

    panel = PanelManager.createBottomPanel("brackets-builder-panel", $(panelHTML), 100);
    $('#builder-panel .close').on('click', function () {
        panel.hide();
    });

    function _processCmdOutput(data) {
        data = JSON.stringify(data);
        data = data.replace(/\\n/g, '<br />').replace(/\"/g, '').replace(/\\t/g, '');
        return data;
    }

    function onPanelClickMaker(filename, line, lastErrors) {
        return function () {
            console.log("Setting doc to " + filename);
            var doc = DocumentManager.getDocumentForPath(filename);
            doc.then(function (doc) {
                DocumentManager.setCurrentDocument(doc);
                decorate.setCurrentFile();
                decorate.add_errors_to_file(lastErrors);

                // set cursor TODO: non working
                var dm = DocumentManager.getCurrentDocument()._masterEditor;
                var cm = dm._codeMirror;
                cm.setCursor(line);
                cm.scrollIntoView({line: line, ch: 0});
            }).done();
        };
    }
    
    function setPanel(data) {
        if (!data) {
            data = "";
            $('#builder-panel .builder-content-errors').empty();
            panel.hide();
            return;
        }
        if (typeof data === "string") {
            $('#builder-panel .resizable-content-error').hide();
            $('#builder-panel .builder-content-result').show().html(_processCmdOutput(data));
        } else {
            $('#builder-panel .builder-content-result').hide();
            $('#builder-panel .resizable-content-error').show();
            $('#builder-panel .builder-content-errors').append(data);
        }
        panel.show();
    }
    
    function cleanFilename(file) {
       // var reg = /[\/\\]([^\/\\]+)$/g;
        //return reg.match(file)[1];
        return file.replace(/^[\w\W]*[\\\/]/, '');
    }

    function setErrors(lastErrors) {
        var panel_txt = "",
            filename,
            n;

        for (filename in lastErrors) {
            if (lastErrors.hasOwnProperty(filename)) {
                var o = lastErrors[filename];
                for (n = 0; n < o.length; n++) {
                
                    panel_txt += "<tr class='panel_error'>";
                    panel_txt += "<td class='error-icon'></td>";
                    panel_txt += "<td>" + _processCmdOutput(o[n].error) + "</td><td>" + cleanFilename(filename) + "</td><td>" + o[n].line + "</td>";
                    panel_txt += "</tr>";

                    var panel_node = $(panel_txt);
                    panel_node.on("click", onPanelClickMaker(filename, o[n].line, lastErrors));
                    console.log("panel_txt " + panel_txt);
                    setPanel(panel_node);
                }
            }
        }
    }

    module.exports = {
        setPanel: setPanel,
        setErrors: setErrors
    };
});