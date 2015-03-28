function onInitFileSystem(filesystem) {
  filesystem.root.getDirectory('folderToDelete', {}, function(dirEntry) {

    // Remove the directory.
    dirEntry.removeRecursively(function(e) {
      console.log('Folder deleted');
    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem,
  errorHandler);
