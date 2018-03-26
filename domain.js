/*global require, exports */

(function () {
    "use strict";

    var child_process = require("child_process"),
        child,
        DomainManager = null,
        domainName = "builder";
    
    function exec(directory, command, callback) {
        console.log("exec "+command+" from "+directory);
        child = child_process.exec(command, {cwd: directory}, function (err, stdout, stderr) {
            child = undefined;
            if(err && !stderr) { stderr = stdout; }
            callback(err ? stderr : undefined, err ? undefined : stdout);
        });
        child.stdout.on('data', function(data) {
            console.log('data!');
            DomainManager.emitEvent(domainName, "data", data);
        });
    }

    function write(data) {
        if (child) {
            child.stdin.write(data);
        }
    }

    exports.exec = exec;
    exports.init = function (_domainManager) {
        DomainManager = _domainManager;
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
        DomainManager.registerCommand(domainName, "write", write, false, "Write to stdin",
            [{
                name: "data",
                type: "string"
            }]);
        DomainManager.registerEvent(domainName, "data",
            [{
                name: "data",
                type: "string"
            }]);
    };

}());
