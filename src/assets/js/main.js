'use strict';

window.jQuery = window.$ = require('jquery');

import ResizeManager from './util/ResizeManager';
import ScrollManager from './util/ScrollManager';

import StructureModule1 from '../namespace/TopPage/Module1/_Module1.js';

const resizeManager = new ResizeManager();
const scrollManager = new ScrollManager();

export const mainResizeManager = resizeManager;

(() => {
  $(() => {
    console.log('page loaded');

    StructureModule1();

    resizeManager.add(resized01);
    resizeManager.init();

    scrollManager.add(scroll01);
    scrollManager.init();
  });

  const resized01 = () => {
    console.log('is resized! 01');
  };
  const scroll01 = () => {
    console.log('is scrolled! 01');
  };
})();
