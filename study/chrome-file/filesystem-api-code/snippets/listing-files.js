// <ul id="fileList"></ul>

function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

function listEntries(entries) {
  var list = document.getElementById('fileList');

  entries.forEach(function(entry, i) {
    var li = document.createElement('li');
    li.innerHTML = entry.name;
    list.appendChild(li);
  });
}

function onInitFileSystem(filesystem) {

  var dirReader = filesystem.root.createReader();
  var entries = [];

  var readEntries = function() {

    dirReader.readEntries(function(results) {

      if (!results.length) {
        listEntries(entries.sort().reverse());
      } else {
        entries = entries.concat(toArray(results));
        readEntries();
      }

    }, errorHandler);

  };

  readEntries();

}

window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFileSystem,
  errorHandler);
