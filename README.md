brackets-http-server
====================

Launches an http-server module (http://127.0.0.1:8989) at project root (if not already launched) and opens the selected file in a new browser tab. The server closes when closing Brackets.

Changing projects is supported and causes the server to simply relaunch at the new project's root.

This is useful if you don't use Brackets' Live Preview, i.e. Live Preview, because of its features, starts way slower and always opens a new browser window.

You can now also set a html file as a startup for a project, just right click the file and select 'Set file as startup for HTTP Server'. With this, every time you start the server for that project, the startup file will always open. To remove a file as startup, right click the file and select 'Remove file as startup for HTTP Server'. Setting a file as startup removes the previous.

<b>Changelog</b>

<i>1.0.5</i>
<ul>
<li>Fixed: HTTP server dies and clicking the server button doesn't restart it</li>
</ul>

<i>1.0.4</i>
<ul>
<li>If the selected file is HTML, that file will open instead of the default file for the project</li>
<li>Set the preferences regarding startup file for each projetc in Brackets preferences file</li>
</ul>

<i>1.0.3</i>
<ul>
<li>Added the ability to set a file as a startup for a project</li>
</ul>

<i>1.0.2</i>
<ul>
<li>Fixed: selected file doesn't launch when pressing for the first time the start server button</li>
</ul>

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