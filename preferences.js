/*jslint plusplus: true, vars: true, nomen: true */
/*global define, brackets, console, setTimeout, $, document, alert */

define(function (require, exports, module) {
    "use strict";
    
    var _runCompile;
    var prefs;
    var DocumentManager = brackets.getModule("document/DocumentManager");
    function run() {
        _runCompile();
        console.log("auto compiling");
    }
    
    function setupPrefs() {
        if (prefs.get("autocompile")) {
            $(DocumentManager).on("currentDocumentChange documentSaved", run);
        } else {
            $(DocumentManager).off("currentDocumentChange documentSaved", run);
        }
    }
    module.exports = function (runCompile) {
        _runCompile = runCompile;
        var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
        prefs = PreferencesManager.getExtensionPrefs("IDE");
        
        prefs.definePreference("autocompile", "boolean", false).on("change", function (e, data) {
            setupPrefs();
        });
        
        //$(DocumentManager).on("currentDocumentChange", handleDocumentChange);
    
        console.log("000" + prefs.get("autocompile"));
        
        setupPrefs();
        
    };
});