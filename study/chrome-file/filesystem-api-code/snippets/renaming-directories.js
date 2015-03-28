function rename(workingDirectory, source, newName) {
  workingDirectory.getDirectory(source, {}, function(dirEntry) {

    dirEntry.moveTo(workingDirectory, newName);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
  rename(filesystem.root, '/videos', 'videos2');
}, errorHandler);
