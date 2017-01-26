import { render } from 'react-dom';
import React from 'react';
import { Router, browserHistory } from 'react-router/es6';
import rootRoute from 'pages/routes';
import 'general.scss';

render(
  <Router history={browserHistory} routes={rootRoute} />,
  document.getElementById('root')
);
