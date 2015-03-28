function copy(workingDirectory, source, destination) {
  workingDirectory.getDirectory(source, {}, function(workingDirEntry) {

    workingDirectory.getDirectory(destination, {}, function(dirEntry) {
      workingDirEntry.copyTo(dirEntry);
    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
  copy(filesystem.root, '/folder1', 'old/');
}, errorHandler);
