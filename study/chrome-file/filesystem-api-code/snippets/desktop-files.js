// <input type="file" id="filePicker" multiple>

// Listen for the change event that is fired when the user finishes selecting
// files from the desktop.
document.getElementById('filePicker').addEventListener('change', function(e) {
  // Get the selected files.
  var files = this.files;

  // Request the file system.
  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(filesystem) {
    // Copy each of the files to the filesystem.
    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      // Create a new file in the app filesystem.
      filesystem.root.getFile(file.name, {create: true, exclusive: true},
        function(fileEntry) {

          // Create a file writer.
          fileEntry.createWriter(function(fileWriter) {

            // Write the contents of the selected file to the file in the app
            // filesystem.
            fileWriter.write(file);

          }, errorHandler);

        }, errorHandler);

    }

  }, errorHandler);

});
