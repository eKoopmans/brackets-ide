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

    var content,
        invis,
        bypass = [16, 17, 18, 19, 20, 27, 33, 34, 35, 37, 38, 39, 40, 45, 91, 92, 93, 144, 145],
        contentText = '';

    panel = WorkspaceManager.createBottomPanel("brackets-builder-panel", $(panelHTML), 100);
    $('#builder-panel .close').on('click', function () {
        panel.hide();
    });

    // Get refs.
    content = $('#builder-panel .builder-content-result');
    invis = $('#builder-panel .invisible-input');

    // Auto-resize textarea.
    content.height(content.scrollHeight + 'px').on('input', function () {
        window.setTimeout(function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        }.bind(this), 0);
    });

    // Special handlers for keyboard input.
    content.on("keydown", handleInput);
    invis.on("input keyup", handleInvis);

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
        if (element.val().replace(/[ |\n]/g, "") === "") {
            element.val(msg + ": empty output").trigger('input');
        }
    }

    function setContentText(val, mergeInvis) {
        if (mergeInvis) {
            val += invis.val() + '\n';
            invis.val('');
        }
        contentText = val;
        content.val(contentText + invis.val()).trigger('input');
    }

    function handleInput(e) {
        var modKey = e.altKey || (e.ctrlKey || e.metaKey) && (e.code !== 'KeyV' && e.code !== 'KeyX');
        if (modKey || bypass.indexOf(e.keyCode) !== -1) {
            return;
        }

        // Handle home key.
        if (e.keyCode === 36) {
            var end = e.shiftKey ? content.selectionEnd : contentText.length;
            content.setSelectionRange(contentText.length, end);
            invis.setSelectionRange(0,end - contentText.length);
            return e.preventDefault();
        }

        // Handle enter key.
        if (e.keyCode === 13) {
            setContentText(contentText, true);
            return e.preventDefault();
        }

        if (content.selectionStart < contentText.length) {
            content.setSelectionRange(content.val().length, content.val().length);
        }
        invis.selectionStart = content.selectionStart - contentText.length;
        invis.selectionEnd = content.selectionEnd - contentText.length;

        // Handle tabs.
        if (e.keyCode === 9) {
            sel = [invis.selectionStart, invis.selectionEnd];
            invis.val(invis.val().slice(0,sel[0]) + '\t' + invis.val().slice(sel[1]));
            invis.setSelectionRange(sel[0]+1, sel[0]+1);
            invis.dispatchEvent(new Event('invis'));
            return e.preventDefault();
        }

        invis.focus();
        return;
    }

    function handleInvis(e) {
        setContentText(contentText);
        content.selectionStart = invis.selectionStart + contentText.length;
        content.selectionEnd = invis.selectionEnd + contentText.length;
        content.focus();
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

    function setPanel(data) {
        setContentText(contentText + data);
        panel.show();
    }

    function setSuccess() {
        $('#builder-panel .build-success').show();
        $('#builder-panel .error-table').hide();
        handleEmptyContent(content, "Sucess");
        panel.show();
    }

    function setErrors(lastErrors) {
        var filename,
            n;

        if (typeof(lastErrors) === "string") {
            $('#builder-panel .build-success').hide();
            $('#builder-panel .error-table').hide();
            setContentText(_processCmdOutput(lastErrors));
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
        handleEmptyContent(content, "Fail");
        panel.show();
    }

    function resetPanel() {
        $('#builder-panel .build-success').hide();
        $('#builder-panel .error-table').hide();
        $('#builder-panel .builder-content-errors').empty();
        invis.val('');
        setContentText('');
        panel.hide();
    }

    module.exports = {
        setPanel: setPanel,
        setSuccess: setSuccess,
        setErrors: setErrors,
        resetPanel: resetPanel
    };
});