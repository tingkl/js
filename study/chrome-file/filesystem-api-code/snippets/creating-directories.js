window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {

  filesystem.root.getDirectory('newFolder', {create: true}, function(dirEntry) {
    // Do something with your new directory.
  }, errorHandler);

}, errorHandler);
