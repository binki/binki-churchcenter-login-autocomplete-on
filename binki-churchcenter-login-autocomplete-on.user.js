// ==UserScript==
// @name     binki-churchcenter-login-autocomplete-on
// @version  1.0.0
// @match https://*.churchcenter.com/login*
// @require https://raw.githubusercontent.com/binki/binki-userscript-when-element-query-selector-async/0a9c204bdc304a9e82f1c31d090fdfdf7b554930/binki-userscript-when-element-query-selector-async.js
// ==/UserScript==

const isOrIsAncestorOf = (elementA, elementB) => {
  if (!elementA) throw new Error('elementA must be specified');
  if (!elementB) throw new Error('elementB must be specified');
  while (elementB) {
    if (elementA === elementB) return true;
    elementB = elementB.parentElement;
  }
  return false;
};

const setup = async () => {
  const deviceValueElement = await whenElementQuerySelectorAsync(document.body, '#device_value');

  const setAutocomplete = () => {
    const type = deviceValueElement.getAttribute('type');
    const expectedAutocomplete = type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'on';
    if (deviceValueElement.getAttribute('autocomplete') !== expectedAutocomplete) {
      deviceValueElement.setAttribute('autocomplete', expectedAutocomplete);
    }
    const expectedName = type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'login';
    if (deviceValueElement.getAttribute('name') !== expectedName) {
      deviceValueElement.setAttribute('name', expectedName);
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
        if (isOrIsAncestorOf(removedNode, deviceValueElement)) {
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
