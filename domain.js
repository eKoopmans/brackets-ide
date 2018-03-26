/*global require, exports */

(function () {
    "use strict";

    var child_process = require("child_process"),
        domainName = "builder.execute";
    
    function exec(directory, command, callback) {
        console.log("exec "+command+" from "+directory);
        child = child_process.exec(command, {cwd: directory}, function (err, stdout, stderr) {
            child = undefined;
            if(err && !stderr) { stderr = stdout; }
            callback(err ? stderr : undefined, err ? undefined : stdout);
        });
    }

    exports.exec = exec;
    exports.init = function (DomainManager) {
        if (!DomainManager.hasDomain(domainName)) {
            DomainManager.registerDomain(domainName, {major: 0, minor: 1});
        }

        DomainManager.registerCommand(domainName, "exec", exec, true, "Exec cmd",
            [
                {
                    name: "directory",
                    type: "string"
                },
                {
                    name: "command",
                    type: "string"
                }
            ],
            [{
                name: "stdout",
                type: "string"
            }]
            );
    };

}());
