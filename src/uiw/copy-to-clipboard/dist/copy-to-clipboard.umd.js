/**! 
 * @uiw/copy-to-clipboard v1.0.17 
 * Copy to clipboard. 
 * 
 * Copyright (c) 2024 Kenny Wang 
 * https://github.com/uiwjs/copy-to-clipboard.git 
 * 
 * @website: https://uiwjs.github.io/copy-to-clipboard
 
 * Licensed under the MIT license 
 */

(function (global, factory) {
  /* eslint-disable-next-line no-unused-expressions */
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  /* eslint-disable-next-line no-restricted-globals */
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.copyTextToClipboard = factory());
})(this, (function () { 'use strict';

  /**
   * *** This styling is an extra step which is likely not required. ***
   * https://github.com/w3c/clipboard-apis/blob/master/explainer.adoc#writing-to-the-clipboard
   * 
   * Why is it here? To ensure:
   * 
   * 1. the element is able to have focus and selection.
   * 2. if element was to flash render it has minimal visual impact.
   * 3. less flakyness with selection and copying which **might** occur if
   *     the textarea element is not visible.
   *
   *   The likelihood is the element won't even render, not even a flash,
   *   so some of these are just precautions. However in IE the element
   *   is visible whilst the popup box asking the user for permission for
   *   the web page to copy to the clipboard.
   *  
   *   Place in top-left corner of screen regardless of scroll position.
   *
   * @typedef CopyTextToClipboard
   * @property {(text: string, method?: (isCopy: boolean) => void) => void} void
   * @returns {void}
   * 
   * @param {string} text 
   * @param {CopyTextToClipboard} cb 
   */
  function copyTextToClipboard(text, cb) {
    if (typeof document === "undefined") return;
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style = {
      position: 'absolute',
      left: '-9999px',
    };
    document.body.appendChild(el);
    const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    let isCopy = false;
    try {
      const successful = document.execCommand('copy');
      isCopy = !!successful;
    } catch (err) {
      isCopy = false;
    }
    document.body.removeChild(el);
    if (selected && document.getSelection) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
    cb && cb(isCopy);
  }

  return copyTextToClipboard;

}));
//# sourceMappingURL=copy-to-clipboard.umd.js.map
