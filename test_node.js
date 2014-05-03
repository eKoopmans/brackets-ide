/*global require, exports, console, use */

var a = require('./domain');
function cb(err, suc) {
    if(err) { console.log(":::" + err); }
    if(suc) { console.log(suc); }
}
var cmd = "ruby /home/jdunlap/.config/Brackets/extensions/user/brackets-compiler-support/test1.rb",
    dir = "/home/jdunlap/.config/Brackets/extensions/user/brackets-compiler-support/";

//var cmd = "ruby test1.rb",
//    dir = ".";

cmd = "php test1.php";
dir = ".";

a.exec(dir, cmd, cb);