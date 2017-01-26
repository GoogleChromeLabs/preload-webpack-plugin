import React, { Component, PropTypes } from 'react';
import ListItem from './ListItem';
import './list.scss';

const { number, node, array, bool, string } = PropTypes;

class List extends Component {
  constructor(props) {
    super(props);

    this.state = { expanded: [] };
  }

  onSelectItem(index) {
    const { collapsible, singleExpand } = this.props;

    if (!collapsible) {
      return false;
    }

    let { expanded } = this.state;
    const expandedIndex = expanded.indexOf(index);

    if (expandedIndex > -1) {
      // collapse expanded item
      expanded = [
        ...expanded.slice(0, expandedIndex),
        ...expanded.slice(expandedIndex + 1)
      ];
    } else if (singleExpand) {
      expanded = [index];
    } else {
      expanded = [...expanded, index];
    }

    this.setState({ expanded });
  }

  showListItems() {
    const me = this;
    const { items, collapsible } = me.props;
    const { expanded } = me.state;
    const onSelectItem = me.onSelectItem.bind(me);

    return items.map((item, idx) => {
      const itemExpanded = !!(expanded.indexOf(idx) > -1);
      return (<ListItem
        {...item}
        onSelectItem={onSelectItem}
        collapsible={collapsible}
        expanded={itemExpanded}
        key={idx}
        index={idx}
      />);
    });
  }

  render() {
    const { columns, children, className } = this.props;
    return (
      <div className={`list columns-${columns} ${className}`}>
        { this.showListItems() }
        { children }
      </div>
    );
  }
}

List.propTypes = {
  columns: number,
  children: node,
  items: array,
  collapsible: bool,
  className: string,
  singleExpand: bool
};

List.defaultProps = {
  columns: 1,
  className: '',
  items: [],
  collapsible: false,
  singleExpand: true
};

export default List;
