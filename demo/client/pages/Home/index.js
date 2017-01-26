import React from 'react';
import Header from 'components/Header';
import List from 'components/List/List';

const twoColListItems = [
  { title: 'One' },
  { title: 'Two' },
  { title: 'Three' },
  { title: 'Four' }
];

export default () => (
  <article className="home">
    <Header title="Home" className="header-dark" />
    <List columns={2} items={twoColListItems} />
  </article>
);
