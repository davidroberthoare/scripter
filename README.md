A simple collaborative screenplay editing app, using Quill.js as the editor and Django/Mysql for user-management and syncing.

Although the basic functions mostly work, it's still a work in progress, and definitely NOT intended for production - - this is just a hobby project for the use of my students. 

The main branch is currently running via daphne & asgi for the "channels" websocket syncing, with Apache as the proxy.

The "standalone" branch includes just the editor with the simple formatting styles, and no multi-user or collaborative features. It just saves locally.
