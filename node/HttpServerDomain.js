/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, node: true */
/*global brackets */

(function () {

    "use strict";

    var _domainManager = null;
    var child;
    
    var killExistingChild = function (callback) {
        if (!child) {
            callback();
            return;
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
        
        killExistingChild(function () {
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
        _domainManager = domainManager;

        if (!_domainManager.hasDomain("http-server")) {
            _domainManager.registerDomain("http-server", {major: 0, minor: 1});
        }

        _domainManager.registerCommand(
            "http-server",
            "start",
            start,
            true
        );
        
        _domainManager.registerCommand(
            "http-server",
            "open",
            open,
            true
        );
    }

    exports.init = init;

}());