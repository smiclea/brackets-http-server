/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, log , Mustache, NodeConnection */


define(function (require, exports, module) {
    "use strict";
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection = brackets.getModule("utils/NodeConnection"),
        ProjectManager = brackets.getModule("project/ProjectManager");
    
    var PORT = '8989';
    var START_SHORTCUT = 'Ctrl-Alt-H';
    
    var nodeConnection = new NodeConnection();
    var icon, rootPath;
    
    var connect = function () {
        var connectionPromise = nodeConnection.connect(true);

        connectionPromise.fail(function (err) {
            console.error("[brackets-http-server] failed to connect to node: " + err);
        });

        return connectionPromise;
    };
    
    var loadHttpServerDomain = function () {
        var path = ExtensionUtils.getModulePath(module, "node/HttpServerDomain");
        var loadPromise = nodeConnection.loadDomains([path], true);

        loadPromise.fail(function (err) {
            console.log("[brackets-http-server] failed to load http-server domain: " + err);
        });

        return loadPromise;
    };
    
    var openSelectedFile = function () {
        var root = ProjectManager.getProjectRoot().fullPath;
        var file = ProjectManager.getSelectedItem().fullPath;
        var path;

        if (file.indexOf(root) > -1) {
            path = 'http:/127.0.0.1:' + PORT + '/' + file.substr(root.length);
        } else {
            path = file;
        }

        nodeConnection.domains['http-server'].open(path);
    };
    
    var startServer = function () {
        var newRootPath = ProjectManager.getProjectRoot().fullPath;
        
        if (newRootPath === rootPath) {
            openSelectedFile();
            return;
        }
        
        rootPath = newRootPath;
        
        nodeConnection.domains['http-server'].start(rootPath, PORT, ExtensionUtils.getModulePath(module)).fail(function (msg) {
            if (msg === 'success') {
                openSelectedFile();
            } else {
                console.log('[brackets-http-server] ', msg);
            }
        });
    };
    
    var addKeyBinding = function () {
        var START_COMMAND_ID = 'httpserver.start';
        CommandManager.register('Start Server', START_COMMAND_ID, startServer);
        KeyBindingManager.addBinding(START_COMMAND_ID, START_SHORTCUT);
    };
    
    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "assets/style.css");
        
        icon = $("<a id='custom-server-icon' href='#'></a>").attr("title", "Custom Server").appendTo($("#main-toolbar .buttons"));
        icon.addClass('disabled');
        
        connect().done(function () {
            loadHttpServerDomain().done(function () {
                icon.removeClass('disabled');
                icon.on("click", startServer);
                addKeyBinding();
            });
        });
    });

});