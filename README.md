Integrated Development for Brackets
================
This extension provides Brackets with integrated development capabilities like compiling, error line markers, and debugging support. Currently works with PHP, Python, JavaScript(Node), and Ruby!

Use the left Run icon or press Ctrl(Cmd)-Alt-B to build current file.

Features:
1. Runs the intepreter against your file and returns the output into a panel.
2. If an error is reported, the panel shows a table list of the reported errors.
3. Click on the errors in the list to jump to the file and error line number.
3. It is possible to create own build systems via 'Edit>Edit Builder' menu item and editing opened JSON-file (you need to restart Brackets). 
4. The build action will save all working set files of the same filetype automatically.

Notes:
**You must have the compiler/interpreter installed within your global path for this extension to execute it.**


TODO:

* Polish the Run Results panel
* Support charactor line locations for error ranges
* Add Java support
* Add step-by-step debugging support

**Pull Requests are encouraged and will be quickly reviewed to be merged!**

Contact: @jonathanAdunlap
![Integrated Development for Brackets](http://i.imgur.com/kHVEprN.png "Integrated Development for Brackets")
