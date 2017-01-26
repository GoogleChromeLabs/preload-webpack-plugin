import React, { Component, PropTypes } from 'react';
import Toolbar from 'components/Toolbar';
import './style.scss';

const tag = document.createElement('script');
tag.async = 1;

const addScript = src => {
  tag.src = src;
  document.head.appendChild(tag.cloneNode());
};

export default class App extends Component {
  componentDidMount() {
    window.__CHUNKS.forEach(addScript);
  }

  render() {
    return (
      <main className="viewport">
        <Toolbar />
        {this.props.children}
      </main>
    );
  }
}

App.propTypes = {
  children: PropTypes.node
};
