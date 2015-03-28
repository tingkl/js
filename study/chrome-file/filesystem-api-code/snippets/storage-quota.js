// navigator.webkitTemporaryStorage || navigator.webkitPersistentStorage

navigator.webkitPersistentStorage.requestQuota(
  1024 * 1024 * 10,
  function(grantedSize) {

    // Request a file system with the new size.
    window.requestFileSystem(window.PERSISTENT, grantedSize, function(filesystem) {
      
      // Do something with your new (larger) filesystem

    }, errorHandler);

  }, function(error) {
    console.log('Error', error);
  }
);
