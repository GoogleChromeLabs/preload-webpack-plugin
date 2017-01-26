import App from 'containers/App';

/**
 * Timestamp gets set when route begins loading
 */
let startTime;

/**
 * Mark the time when router leaves a route
 */
const onLeave = () => startTime = Date.now();

/**
 * Calculate route transition time
 */
const calculateTransitionTime = () => {
  const diff = ~~(Date.now() - startTime);
  diff && console.log('%c Transition time:', 'color: #3241e5;', diff, 'ms');
};

/**
 * Show error if something went wrong during chunk loading
 */
const errorLoading = err => console.error('Dynamic page loading failed', err);

/**
 * Parse loaded module
 */
const loadRoute = cb => {
  onLeave();
  return module => {
    calculateTransitionTime();
    cb(null, module.default);
  };
};

export default {
  component: App,
  childRoutes: [
    {
      path: '/',
      getComponent(location, cb) {
        System.import('pages/Home')
          .then(loadRoute(cb))
          .catch(errorLoading);
      }
    },
    {
      path: 'blog',
      getComponent(location, cb) {
        System.import('pages/Blog')
          .then(loadRoute(cb))
          .catch(errorLoading);
      }
    },
    {
      path: 'about',
      getComponent(location, cb) {
        System.import('pages/About')
          .then(loadRoute(cb))
          .catch(errorLoading);
      }
    },
  ]
};
