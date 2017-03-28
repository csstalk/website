'use strict';

export default () => {

  const mic_offset_top = $('.home-Mic').offset().top + 400;

  $(window).on({
    'scroll': () => {
      if ($(window).scrollTop() + $(window).height() > mic_offset_top) {
        $('.home-Mics').addClass('home-Mic_Animate');
        $(window).off('scroll');
      }
    }
  });
}
