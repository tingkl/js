function move(workingDirectory, source, destination) {
  workingDirectory.getDirectory(source, {}, function(sourceDirEntry) {

    workingDirectory.getDirectory(destination, {}, function(destDirEntry) {
      sourceDirEntry.moveTo(destDirEntry);
    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
  move(filesystem.root, '/one', '/two');
}, errorHandler);
