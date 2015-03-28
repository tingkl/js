function onInitFileSystem(filesystem) {
  filesystem.root.getFile('treehouse.txt', {create: false},
    function(fileEntry) {

      fileEntry.remove(function(e) {
        console.log('File deleted');
      }, errorHandler);

    }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem,
  errorHandler);
