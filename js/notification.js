/*
  Displays a notification when the current time is equal the end-day time. Requires "notifications"
  permission in the manifest file (or calling
  "webkitNotifications.requestPermission" beforehand).
*/
function show() {

  var baseDate = new Date();
  var time = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
  var timeNow = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(),baseDate.getHours(),baseDate.getMinutes(),0);

  var storageDay = localStorage.getItem(time);
      storageDay = jQuery.parseJSON(storageDay);

  if (timeNow.getTime() == storageDay["saida"]){
    var notification = window.webkitNotifications.createNotification(
      'res/icon_128.png',                                     // The image.
      baseDate.getHours()+":"+baseDate.getMinutes(),          // The title.
      'Time to go home.'                                      // The body.
    );
    notification.show();

  }

}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true;   // The display activation.
  localStorage.frequency = 1;        // The display frequency, in minutes.
  localStorage.isInitialized = true; // The option initialization.
}

// Test for notification support.
if (window.webkitNotifications) {
  // While activated, show notifications at the display frequency.
  if (JSON.parse(localStorage.isActivated)) { show(); }

  var interval = 0; // The display interval, in minutes.

  setInterval(function() {
    interval++;

    if (
      JSON.parse(localStorage.isActivated) &&
        localStorage.frequency <= interval

    ) {
      show();
      interval = 0;
    }
  }, 60000);
}
