// ==UserScript==
// @name     binki-churchcenter-login-autocomplete-on
// @version  1.0.2
// @match https://*.churchcenter.com/login*
// @require https://raw.githubusercontent.com/binki/binki-userscript-when-element-query-selector-async/0a9c204bdc304a9e82f1c31d090fdfdf7b554930/binki-userscript-when-element-query-selector-async.js
// ==/UserScript==

const setup = async () => {
  const deviceValueElement = await whenElementQuerySelectorAsync(document.body, '#device_value');

  const setAutocomplete = () => {
    const type = deviceValueElement.getAttribute('type');
    const expectedName = type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'login';
    if (deviceValueElement.name !== expectedName) {
      deviceValueElement.name = expectedName;
    }
    const expectedAutocomplete = type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'on';
    if (deviceValueElement.getAttribute('autocomplete') !== expectedAutocomplete) {
      deviceValueElement.setAttribute('autocomplete', expectedAutocomplete);
      // Somehow this is needed when combined with binki-churchcenter-login-prefer-email (or to even blur and focus Firefox itself)
      // since Firefox must have some race condition in activating the autofill logic while also switching the input type?
      // Weird.
      if (document.activeElement === deviceValueElement) {
        deviceValueElement.blur();
        deviceValueElement.focus();
      }
    }
  };

  new MutationObserver((changes, observer) => {
    setAutocomplete();
  }).observe(deviceValueElement, {
    attributeFilter: [
      'autocomplete',
      'name',
      'type',
    ],
  });
  // Since things like “Edit email address” results in a new element being generated, we need to monitor for the element to reappear after it disappears.
  new MutationObserver((changes, observer) => {
    for (const change of changes) {
      for (const removedNode of change.removedNodes) {
        if (removedNode.contains(deviceValueElement)) {
          observer.disconnect();
          setup();
        }
      }
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
  });

  setAutocomplete();
};

setup();
