brackets-http-server
====================

Launches an http-server module (http://127.0.0.1:8989) at project root and opens the selected file in a new browser tab. The server closes when closing Brackets.

You can now also set a html file as a startup for a project, just right click the file and select 'Set file as startup for HTTP Server'. With this, every time you start the server for that project, the startup file will always open, except if an html file is selected. To remove a file as startup, right click the file and select 'Remove file as startup for HTTP Server'. Setting a file as startup removes the previous.

<b>Changelog</b>

<i>1.0.7</i> 
<ul>
<li>Fixed: Issue with opening a file if path contains a space</li>
</ul>

<i>1.0.5</i> 
<ul>
<li>Fixed: HTTP server dies and clicking the server button doesn't restart it</li>
<li>Fixed: Handle space in module path</li>
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