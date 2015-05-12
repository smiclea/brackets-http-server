/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */


define(function (require, exports, module) {
    "use strict";
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection = brackets.getModule("utils/NodeConnection"),
		Menus = brackets.getModule("command/Menus"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    
    var PORT = '8989';
    var START_SHORTCUT = 'Ctrl-Alt-T';
	var CONTEXT_MENU_SET = 'Set startup for HTTP Server';
	var CONTEXT_MENU_REMOVE = 'Remove startup for HTTP Server';
	
	var NAMESPACE = 'brackets-http-server';
	
    var nodeConnection = new NodeConnection();
    var icon, rootPath;
	var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
	
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
    
	var getExtension = function (path) {
		var ext = path.substr(path.lastIndexOf('.') + 1).toLowerCase();
		return ext;
	};
	
    var openFile = function () {
		var projStartup = PreferencesManager.get(NAMESPACE + '.' + ProjectManager.getProjectRoot().name + '-startup');
		var root = ProjectManager.getProjectRoot().fullPath;
		var file = ProjectManager.getSelectedItem().fullPath;
		var path;
		
		if (projStartup && getExtension(file) !== 'html' && getExtension(file) !== 'htm') {
			file = projStartup;
		}
		
		if (file.indexOf(root) > -1) {
			path = 'http:/127.0.0.1:' + PORT + '/' + file.substr(root.length);
		} else {
			path = file;
		}

		nodeConnection.domains['http-server'].open(path);
    };
    
    var startServer = function () {
        var newRootPath = ProjectManager.getProjectRoot().fullPath;
        
        //if (rootPath && newRootPath === rootPath) {
          //  openFile();
            //return;
        //}
        
        rootPath = newRootPath;
        
        var modPath = ExtensionUtils.getModulePath(module).replace(/ /g, "\\ ");
        nodeConnection.domains['http-server'].start(rootPath, PORT, modPath).fail(function (msg) {
            if (msg === 'success') {
                openFile();
            } else {
				console.error('[brackets-http-server] Process start error. ', msg);
            }
        }).done(function () {
			openFile();
		});
    };
    
    var addKeyBinding = function () {
        var START_COMMAND_ID = 'httpserver.start';
        CommandManager.register('Start Server', START_COMMAND_ID, startServer);
        KeyBindingManager.addBinding(START_COMMAND_ID, START_SHORTCUT);
    };
    
	var addCloseListener = function () {
		$(ProjectManager).on('beforeAppClose', function () {
			nodeConnection.domains['http-server'].kill(function () {});
		});
	};
	
	var addContextMenu = function () {
		var SET_CMD = 'http_server_set_startup_cmd';
		var REMOVE_CMD = 'http_server_remove_startup_cmd';
		var divider, menuItem;
		if (!CommandManager.get(SET_CMD)) {
			CommandManager.register(CONTEXT_MENU_SET, SET_CMD, function () {
				var selFile = ProjectManager.getSelectedItem().fullPath;
				PreferencesManager.set(NAMESPACE + '.' + ProjectManager.getProjectRoot().name + '-startup', selFile);
			});
		}
		
		if (!CommandManager.get(REMOVE_CMD)) {
			CommandManager.register(CONTEXT_MENU_REMOVE, REMOVE_CMD, function () {
				PreferencesManager.set(NAMESPACE + '.' + ProjectManager.getProjectRoot().name + '-startup', '');
			});
		}
		
		$(contextMenu).on("beforeContextMenuOpen", function () {
			var selectedItem = ProjectManager.getSelectedItem();
			var extension = getExtension(selectedItem.name);
			
			if (menuItem) {
				contextMenu.removeMenuItem(menuItem);
				menuItem = null;
			}
			
			if (divider) {
				contextMenu.removeMenuDivider(divider.id);
				divider = null;
			}
			
			if (extension === 'htm' || extension === 'html') {
				var projStartup = PreferencesManager.get(NAMESPACE + '.' + ProjectManager.getProjectRoot().name + '-startup');
				
				divider = contextMenu.addMenuDivider(Menus.LAST);
				
				if (projStartup === selectedItem.fullPath) {
					contextMenu.addMenuItem(REMOVE_CMD, '', Menus.LAST, REMOVE_CMD);
					menuItem = REMOVE_CMD;
				} else {
					contextMenu.addMenuItem(SET_CMD, '', Menus.LAST, SET_CMD);
					menuItem = SET_CMD;
				}
			}
		});
	};
	
    AppInit.appReady(function () {
        ExtensionUtils.loadStyleSheet(module, "assets/style.css");
        
        icon = $("<a id='custom-server-icon' href='#'></a>").attr("title", "Start HTTP Server (" + START_SHORTCUT + ")").appendTo($("#main-toolbar .buttons"));
        icon.addClass('disabled');
        
        connect().done(function () {
            loadHttpServerDomain().done(function () {
                icon.removeClass('disabled');
                icon.on("click", startServer);
                addKeyBinding();
				addCloseListener();
            });
        });
		
		addContextMenu();
    });

});