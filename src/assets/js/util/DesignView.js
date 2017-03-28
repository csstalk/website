'use strict';

export default () => {
  if ($('.home').length < 1) {
    return false;
  }

  $('body').toggleClass('home-DesignView', true);

  $(window).keydown((e) => {
    if (e.keyCode === 49) {
      // key "1"
      $('body').toggleClass('home-DesignView');
    }
  });

  return true;
}
