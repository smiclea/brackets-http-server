brackets-http-server
====================

Launches an http-server module (http://127.0.0.1:8989) at project root (if not already launched) and opens the selected file in a new browser tab. The server closes when closing Brackets.

Changing projects is supported and causes the server to simply relaunch at the new project's root.

This is useful if you don't use Brackets' Live Preview, i.e. Live Preview, because of its features, starts way slower and always opens a new browser window.

<b>Changelog</b>

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