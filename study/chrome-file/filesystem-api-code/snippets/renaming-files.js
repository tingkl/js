function rename(workingDirectory, source, newName) {
  workingDirectory.getFile(source, {}, function(fileEntry) {

    fileEntry.moveTo(workingDirectory, newName);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
  rename(filesystem.root, 'treehouse.txt', 'mikethefrog.txt');
}, errorHandler);
