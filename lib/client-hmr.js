/*
  Copyright © 2018 Andrew Powell
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/

const hmr = {
  onUnaccepted(data) {
    console.warn('Change in unaccepted module(s):\n', data);
    console.warn(data);
  },
  onDeclined(data) {
    console.warn('Change in declined module(s):\n', data);
  },
  onErrored(data) {
    console.error('Error in module(s):\n', data);
  }
};

const applyHmr = async (hash) => {
  const { apply, check, status } = module.hot;

  const hmrStatus = status();

  if (hmrStatus === 'abort' || hmrStatus === 'fail') {
    console.warn(`An HMR update was triggered, but ${hmrStatus}ed. Please Refresh your page`);
    return;
  }

  let modules;

  try {
    modules = await check(false);
  } catch (e) {
    console.error('HMR: HMR Error\n', e);
  }

  if (!modules) {
    console.warn(`No modules found for replacement. Please Refresh your page`);
    return;
  }

  modules = await apply(hmr);

  if (modules) {
    console.log(`Build ${hash.slice(0, 7)} replaced:\n`, modules);
  }
};

module.exports = { applyHmr };
