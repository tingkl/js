function onInitFileSystem(filesystem) {
  filesystem.root.getFile('treehouse.txt', {create: true}, function(fileEntry) {

    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        console.log('Write completed!');
      };

      fileWriter.onerror = function(e) {
        console.log('Write error: ' + e.toString());
      };

      var contentBlob = new Blob(['Treehouse rocks!'], {type: 'text/plain'});

      fileWriter.write(contentBlob);

    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem,
  errorHandler);
