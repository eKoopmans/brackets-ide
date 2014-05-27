Integrated Development for Brackets
================
This extension provides Brackets with integrated development capabilities like compiling, error line markers, and debugging support. Currently works with PHP, Python, Ruby, Perl, Dlang and JavaScript(Node)!

Use the left Run icon or press Ctrl(Cmd)-Alt-B to build current file.

**Features:**

1. Runs the intepreter against your file and returns the output into a panel.
2. If an error is reported, the panel shows a table list of the reported errors.
3. Click on the errors in the list to jump to the file and error line number. The line will be marked red with the error message viewable on mouse hover.
3. It is possible to create own build systems via 'Edit>Edit Builder' menu item and editing opened JSON-file (you need to restart Brackets). 
4. The build action will save all working set files of the same filetype automatically.

**Auto Compile**
In your project root preference file ".brackets.json", you can enable to the compiler to run every time you save the current file.

Example .brackets.json file:
{
    "IDE.autocompile": true
}

**Notes:**
You must have the **compiler/interpreter installed** within your global path for this extension to execute it.


**TODO:**

* Autocompile can be locked to a specific file
* Polish the Run Results panel (with colors of the current theme)
* Support charactor line locations for error ranges
* Add TypeScript & CoffeeScript support
* Add Java support
* Add step-by-step debugging support

**Pull Requests are encouraged and will be quickly reviewed to be merged!**

Built upon https://github.com/Vhornets/brackets-builder for command execution, although much of it has been already rewritten.

Contact: @jonathanAdunlap
![Integrated Development for Brackets](http://i.imgur.com/kHVEprN.png "Integrated Development for Brackets")
