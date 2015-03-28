function onInitFileSystem(filesystem) {
  filesystem.root.getFile('treehouse.txt', { create: true, exclusive: true },
    function(fileEntry) {

      // Do something with your new file.

    }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem,
  errorHandler);
