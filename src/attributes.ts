import { init } from '../packages/list/src/init';

// Bootstrap window.FinsweetAttributes so internal helpers can iterate
// window.FinsweetAttributes.scripts to read global settings from the <script> tag.
window.FinsweetAttributes = Object.assign(
  {
    scripts: [...document.querySelectorAll<HTMLScriptElement>('script[fs-list]')],
    modules: {},
    process: new Set(),
    version: '2.0.0',
    push: () => {},
    load: () => undefined,
    utils: {},
  },
  window.FinsweetAttributes ?? {}
);

init();
