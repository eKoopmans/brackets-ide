/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout, $, document, alert */

define(function (require, exports, module) {
    "use strict";
    var WorkspaceManager = brackets.getModule("view/WorkspaceManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        decorate = require("decorate");

    var panel,
        panelHTML = require('text!results-panel.html'),
        panelIsVisible = false;

    panel = WorkspaceManager.createBottomPanel("brackets-builder-panel", $(panelHTML), 100);
    $('#builder-panel .close').on('click', function () {
        panel.hide();
    });

    function _processCmdOutput(data) {
        data = data.replace(/^[ ]*(\\n)+/, ''); // remove starting new lines
        //data = JSON.stringify(data);

        //data = data.replace(/\\n/g, '<br />').replace(/\\t/g, '');
        data.replace(/^[ ]*\"/, '').replace(/\"[ ]*$/, ''); // remove quotes
        return data;
    }

    function cleanFilename(file) {
        return file.replace(/^[\w\W]*[\\\/]/, '');
    }

    function handleEmptyContent(element, msg) {
        if (element.text().replace(/[ |\n]/g, "") === "") {
            element.text(msg + ": empty output");
        }
    }

    function onPanelClickMaker(filename, errObj, lastErrors) {
        var line = errObj.line;
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
                cm.scrollIntoView({
                    line: line,
                    ch: 0
                });
                EditorManager.focusEditor();
            }).done();
        };
    }

    function setPanel(data, compilerFail) {
        if (typeof data === "string") {
            $('#builder-panel .resizable-content-error').hide();
            $('#builder-panel .builder-content-result').show().text(_processCmdOutput(data));
        } else {
            $('#builder-panel .resizable-content-success').hide();
            $('#builder-panel .resizable-content-error').show();
            $('#builder-panel .builder-content-errors').append(data);
        }

        if (compilerFail) {
            $('.build-success').hide();
        } else {
            $('.build-success').show();
        }
        panel.show();
    }

    function setSuccess() {
        $('#builder-panel .build-success').show();
        $('#builder-panel .error-table').hide();
        handleEmptyContent($('#builder-panel .builder-content-result'), "Sucess");
        panel.show();
    }

    function setErrors(lastErrors) {
        var filename,
            n;

        if (typeof(lastErrors) === "string") {
            $('#builder-panel .build-success').hide();
            $('#builder-panel .error-table').hide();
            $('#builder-panel .builder-content-result').text(_processCmdOutput(lastErrors));
            return panel.show();
        }

        for (filename in lastErrors) {
            if (lastErrors.hasOwnProperty(filename)) {
                var o = lastErrors[filename];
                for (n = 0; n < o.length; n++) {

                    var panel_txt = "<tr class='panel_error'>";
                    panel_txt += "<td class='error-icon'></td>";
                    panel_txt += "<td><pre>" + _processCmdOutput(o[n].error) + "</pre></td>";
                    panel_txt += "<td>" + cleanFilename(filename) + "</td><td>" + (+(o[n].line) + 1) + "</td>";
                    panel_txt += "</tr>";

                    var panel_node = $(panel_txt);
                    panel_node.on("click", onPanelClickMaker(filename, o[n], lastErrors));
                    //console.log("panel_txt " + panel_txt);
                    $('#builder-panel .builder-content-errors').append(panel_node);
                }
            }
        }
        $('#builder-panel .build-success').hide();
        $('#builder-panel .error-table').show();
        handleEmptyContent($('#builder-panel .builder-content-result'), "Fail");
        panel.show();
    }

    function resetPanel() {
        $('#builder-panel .build-success').hide();
        $('#builder-panel .error-table').hide();
        $('#builder-panel .builder-content-result').empty();
        $('#builder-panel .builder-content-errors').empty();
        panel.hide();
    }

    module.exports = {
        setPanel: setPanel,
        setSuccess: setSuccess,
        setErrors: setErrors,
        resetPanel: resetPanel
    };
});