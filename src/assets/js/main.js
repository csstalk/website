'use strict';

window.jQuery = window.$ = require('jquery');

import Mic from './Home/Mic';
import DesignView from './util/DesignView';

(() => {
  $(() => {
    Mic();
    DesignView();
  });
})();
