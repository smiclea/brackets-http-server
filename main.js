/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, log , Mustache, NodeConnection */


define(function (require, exports, module) {
    "use strict";
    
    var CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        AppInit = brackets.getModule("utils/AppInit"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection = brackets.getModule("utils/NodeConnection"),
		Menus = brackets.getModule("command/Menus"),
		FileSystem = brackets.getModule("filesystem/FileSystem"),
        ProjectManager = brackets.getModule("project/ProjectManager");
    
    var PORT = '8989';
    var START_SHORTCUT = 'Ctrl-Alt-T';
	var CONTEXT_MENU_SET = 'Set startup for HTTP Server';
	var CONTEXT_MENU_REMOVE = 'Remove startup for HTTP Server';
	var CONFIG_NAME = 'startup.config';
	var CONFIG_EXP = /\$project\s*:\s*(.*)\s*;\s*\$startup\s*:\s*(.*)\s*/gm;
	
    var nodeConnection = new NodeConnection();
    var icon, rootPath;
	var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
	var configProjects = [];
	
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
    
	var readConfig = function (callback) {
		var configPath = ExtensionUtils.getModulePath(module) + CONFIG_NAME;
		var match;

		configProjects = [];

		var file = FileSystem.getFileForPath(configPath);
		file.read(function (error, data) {
			if (error) {
				console.error('[brackets-http-server] Error reading config file (' + configPath + '): ' + error);
				return;
			}

			while ((match = CONFIG_EXP.exec(data)) !== null) {
				configProjects.push({
					project: match[1].trim(),
					startup: match[2].trim()
				});
			}

			if (callback) {
				callback();
			}
		});
	};
	
    var openFile = function () {
		readConfig(function () {
			var root = ProjectManager.getProjectRoot().fullPath;
			var file = ProjectManager.getSelectedItem().fullPath;
			var path;
			
			$.each(configProjects, function (i, item) {
				if (item.project === ProjectManager.getProjectRoot().name) {
					file = item.startup;
				}
			});
			
			if (file.indexOf(root) > -1) {
				path = 'http:/127.0.0.1:' + PORT + '/' + file.substr(root.length);
			} else {
				path = file;
			}
			
			nodeConnection.domains['http-server'].open(path);
		});
    };
    
    var startServer = function () {
        var newRootPath = ProjectManager.getProjectRoot().fullPath;
        
        if (rootPath && newRootPath === rootPath) {
            openFile();
            return;
        }
        
        rootPath = newRootPath;
        
        nodeConnection.domains['http-server'].start(rootPath, PORT, ExtensionUtils.getModulePath(module)).fail(function (msg) {
            if (msg === 'success') {
                openFile();
            } else {
				console.error('[brackets-http-server] Process start error. ', msg);
            }
        }).done(function (msg) {
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
	
	var writeConfig = function () {
		var configPath = ExtensionUtils.getModulePath(module) + CONFIG_NAME;
		var file = FileSystem.getFileForPath(configPath);
		var i, data = '';
		
		for (i = 0; i < configProjects.length; i++) {
			data += '$project: ' + configProjects[i].project + '; $startup: ' + configProjects[i].startup + '\n';
		}
		
		file.write(data, function (error) {
			if (error) {
				console.error('[brackets-http-server] Error writing config file (' + configPath + '): ' + error);
			}
		});
	};
	
	var setFileAsStartup = function () {
		readConfig(function () {
			var currentProject = ProjectManager.getProjectRoot().name;
			var selFile = ProjectManager.getSelectedItem().fullPath;
			var i, found;
			
			for (i = 0; i < configProjects.length; i++) {
				if (configProjects[i].project === currentProject) {
					configProjects[i].startup = selFile;
					found = true;
					break;
				}
			}
			
			if (!found) {
				configProjects.push({
					project: currentProject,
					startup: selFile
				});
			}
			
			writeConfig();
		});
	};
	
	var removeFileAsStartup = function () {
		readConfig(function () {
			var currentProject = ProjectManager.getProjectRoot().name;
			var selFile = ProjectManager.getSelectedItem().fullPath;
			var i, found = -1;

			for (i = 0; i < configProjects.length; i++) {
				if (configProjects[i].project === currentProject && configProjects[i].startup === selFile) {
					found = i;
					break;
				}
			}

			if (found >= 0) {
				configProjects.splice(i, 1);
				writeConfig();
			}
		});
	};
	
	var addContextMenu = function () {
		var SET_CMD = 'http_server_set_startup_cmd';
		var REMOVE_CMD = 'http_server_remove_startup_cmd';
		var divider, menuItem;

		if (!CommandManager.get(SET_CMD)) {
			CommandManager.register(CONTEXT_MENU_SET, SET_CMD, function () {
				setFileAsStartup();
			});
		}
		
		if (!CommandManager.get(REMOVE_CMD)) {
			CommandManager.register(CONTEXT_MENU_REMOVE, REMOVE_CMD, function () {
				removeFileAsStartup();
			});
		}
		
		$(contextMenu).on("beforeContextMenuOpen", function (evt) {
			var selectedItem = ProjectManager.getSelectedItem();
			var extension = selectedItem.name.split('.')[selectedItem.name.split('.').length - 1].toLowerCase();
			
			if (menuItem) {
				contextMenu.removeMenuItem(menuItem);
				menuItem = null;
			}
			
			if (divider) {
				contextMenu.removeMenuDivider(divider.id);
				divider = null;
			}
			
			if (extension === 'htm' || extension === 'html') {
				readConfig(function () {
					var found, i;
					
					for (i = 0; i < configProjects.length; i++) {
						if (configProjects[i].project === ProjectManager.getProjectRoot().name && configProjects[i].startup === selectedItem.fullPath) {
							found = true;
							break;
						}
					}
					
					if (found) {
						contextMenu.addMenuItem(REMOVE_CMD, '', Menus.LAST, REMOVE_CMD);
						menuItem = REMOVE_CMD;
					} else {
						contextMenu.addMenuItem(SET_CMD, '', Menus.LAST, SET_CMD);
						menuItem = SET_CMD;
					}
					
					divider = contextMenu.addMenuDivider(Menus.LAST);
				});
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