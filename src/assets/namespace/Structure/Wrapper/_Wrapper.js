'use strict';

window.jQuery = window.$ = require('jquery');

export default () => {
  console.log(`現在のlocation.pathnameは ${location.pathname} です。`);
};
