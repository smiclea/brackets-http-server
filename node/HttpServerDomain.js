/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, node: true */
/*global brackets */

(function () {

    "use strict";

    var child;
    
    var killServerProcess = function (callback) {
        if (!child) {
            callback();
        }
		
        var exec = require('child_process').exec;
        
        exec('taskkill /PID ' + child.pid + ' /T /F', function (error, stdout, stderr) {
            child = null;
            callback();
        });
    };
    
    function start(path, port, rootPath, callback) {
        var exec = require('child_process').exec,
            cmd = rootPath + 'node/node_modules/.bin/http-server -c-1 -p ' + port + ' ' + path,
            output = '';
        
		killServerProcess(function () {
            child = exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    callback(stderr);
                }
            });

            child.stdout.on("data", function (data) {
                callback('success');
            });
        });
    }

    function open(path) {
        var exec = require('child_process').exec;
        exec('start ' + path + '?t=' + (new Date().getTime()));
    }
    
    /**
     *
     */
    function init(domainManager) {
		if (!domainManager.hasDomain("http-server")) {
			domainManager.registerDomain("http-server", {major: 0, minor: 1});
        }

		domainManager.registerCommand(
            "http-server",
            "start",
            start,
            true
        );
        
		domainManager.registerCommand(
            "http-server",
            "open",
            open,
            true
        );
		
		domainManager.registerCommand(
			"http-server",
			"kill",
			killServerProcess,
			true
		);
    }

    exports.init = init;

}());