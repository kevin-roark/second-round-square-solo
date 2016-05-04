

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var dir = 'media/thumbnails';
var files = filesInPath(dir, true);

var idx = 0;
convertNextFile();

function convertNextFile() {
  convert(files[idx], function() {
    idx += 1;
    if (idx < files.length) {
      convertNextFile();
    }
    else {
      console.log('done...');
    }
  });
}

function convert(file, callback) {
  var outputFile = file.substring(dir.length + 1).replace('mp4', 'jpg');

  var command =
    'ffmpeg -y -ss 0 -i ' + file +
    ' -frames:v 1' +
    ' media/thumbnails/' + outputFile;

  console.log('running ' + command + ' .... ');
  exec(command, function() {
    if (callback) callback();
  });
}

function filesInPath(dir) {
  var files = [];

  fs.readdirSync(dir).forEach(function(file) {
    var filepath = path.join(dir, file);

    var stat = fs.statSync(filepath);
    if (stat && stat.isDirectory()) {
      files = files.concat(filesInPath(filepath));
    }
    else {
      if (file.indexOf('mp4') >= 0) {
        files.push(filepath);
      }
    }
  });

  return files;
}
