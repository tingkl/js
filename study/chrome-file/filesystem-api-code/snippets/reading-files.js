function onInitFileSystem(filesystem) {
  filesystem.root.getFile('treehouse.txt', {}, function(fileEntry) {

    fileEntry.file(function(file) {
      var reader = new FileReader();

      reader.onload = function(e) {
        var viewerElement = document.createElement('pre');
        viewerElement.innerHTML = this.result;
        document.body.appendChild(viewerElement);
      };

      reader.readAsText(file);
    }, errorHandler);

  }, errorHandler);
}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem,
  errorHandler);
