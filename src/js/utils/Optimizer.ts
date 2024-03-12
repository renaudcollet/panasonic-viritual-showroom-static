/* 
https://ehsangazar.com/optimizing-javascript-event-listeners-for-performance-e28406ad406c
*/

export const throttle = function(callback: Function, limit: number = 100) {
  var wait = false;
  return function () {
    if (!wait) {
      callback.apply(null, arguments);
      wait = true;
      setTimeout(function () {
        wait = false;
      }, limit);
    }
  }
}