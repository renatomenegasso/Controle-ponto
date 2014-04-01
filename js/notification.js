/*
  Displays a notification when the current time is equal the end-day time. Requires "notifications"
  permission in the manifest file (or calling
  "webkitNotifications.requestPermission" beforehand).
*/

function loadEndDay(){

  var baseDate = new Date();
  var time = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
  var endDay;

  var endDayValue = $("#"+time).find(".end-day").find("input").val();
  var placeholderEndDay = $("#"+time).find(".end-day").find("input").attr("placeholder");

  if(endDayValue != "" && endDay!= undefined)
      var endDay = endDayValue;
  else
      var endDay = placeholderEndDay;

  // store in localStorage to run in background
  if(endDay != "" && endDay!= undefined){
      console.log("guardar no localStorage");
      localStorage.setItem("endDay", endDay);
  }
  else if(endDay == "" || endDay == undefined){
      var localEndDay = localStorage.getItem("endDay");
      if(localEndDay != "" || localEndDay!= undefined){
          endDay = localEndDay;
      }
  }

  return endDay;

}


function show() {

  var baseDate = new Date();
  var notificationHour = baseDate.getHours()+":"+baseDate.getMinutes();

  // for test fixe one hour; Example: notificationHour="17:13";

  var endDay = loadEndDay();

  if (endDay != undefined && notificationHour == endDay){
    var notification = window.webkitNotifications.createNotification(
      'res/icon_128.png',            // The image.
      endDay,                 // The title.
      'Time to go home.'      // The body.
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
