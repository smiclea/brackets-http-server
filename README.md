brackets-http-server
====================

Starts http-server node module on port 8989 at the project root and launches the selected file. Click the server icon on the right panel or Ctrl-Alt-T to start the server (if not already started) and launch the file.

This extension is useful if you don't want to use Bracket's Live Preview feature. Instead of launching the file in a new browser window, this extension opens a new tab in the current browser's window.

Navigating to http://127.0.0.1:8989 after the server was started will always return the root project.

You are able to change the projects and if you change the project and launch a file from the new project, the server will restart setting the new project's path as the server's root.

<b>Changelog</b>

<i>1.0.1</i>
<ul>
<li>First stable release</li>
<li>Fixed: http-server process doesn't always close when closing or reloading Brackets</li>
</ul>

<i>0.1.1</i>
<ul>
<li>Updated start button keyboard shortcut so it doesn't conflict with Bracket's own shortcuts</li>
<li>Updated the start icon title to include shortcut info</li>
</ul>

<i>0.0.1</i>
<ul>
<li>First release</li>
</ul>