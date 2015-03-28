function move(workingDirectory, source, directoryName) {
  workingDirectory.getFile(source, {}, function(fileEntry) {

    workingDirectory.getDirectory(directoryName, {}, function(dirEntry) {
      fileEntry.moveTo(dirEntry);
    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
  move(filesystem.root, '/treehouse.txt', 'folder/');
}, errorHandler);
