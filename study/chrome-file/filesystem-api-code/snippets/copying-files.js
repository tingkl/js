function copy(workingDirectory, source, destination) {
  workingDirectory.getFile(source, {}, function(fileEntry) {

    workingDirectory.getDirectory(destination, {}, function(dirEntry) {
      fileEntry.copyTo(dirEntry);
    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
  copy(filesystem.root, '/folder1/treehouse.txt', 'folder2/');
}, errorHandler);
