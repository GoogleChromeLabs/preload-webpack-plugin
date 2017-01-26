import React, { Component, PropTypes } from 'react';
const { string, any, bool, func, number, node } = PropTypes;

class ListItem extends Component {
  constructor(props) {
    super(props);

    this.state = { expanded: false };
  }

  componentWillReceiveProps(props) {
    this.setState({
      expanded: props.expanded
    });
  }

  toggleContent() {
    const { expanded } = this.state;
    const { onSelectItem, index, onExpanded } = this.props;
    this.setState({
      expanded: !expanded
    });

    if (onSelectItem) {
      onSelectItem(index);
    }

    if (!expanded && onExpanded) {
      onExpanded(index);
    }
  }

  render() {
    const { expanded } = this.state;
    const {
      iconUrl,
      title,
      collapsible,
      showArrow,
      content,
      iconClassName,
      children
    } = this.props;

    const iconStyle = iconUrl ? { backgroundImage: `url('${iconUrl}')` } : {};
    const commonClassNames = `arrow show-${showArrow}`;
    const collapsibleClassNames = `${commonClassNames} collapsible expanded-${expanded}`;
    const contentStyle = { maxHeight: (expanded ? '50px' : '0px') };
    const toggleExpand = this.toggleContent.bind(this);
    const arrow = collapsible ? <div className={collapsibleClassNames}>&gt;</div> : undefined;

    return (
      <div className="list-item">
        <div className="title" onClick={toggleExpand}>
          <div className={`icon ${iconClassName}`} style={iconStyle}></div>
          <div className="label">{ title || children }</div>
          {arrow}
        </div>
        <div className="content" style={contentStyle}>
          { content }
        </div>
      </div>
    );
  }
}

ListItem.propTypes = {
  iconClassName: string,
  iconUrl: string,
  title: string,
  route: string,
  showArrow: bool,
  children: any,
  collapsible: bool,
  content: node,
  onSelectItem: func,
  onExpanded: func,
  index: number,
  expanded: bool
};

ListItem.defaultProps = {
  iconClassName: '',
  showArrow: true,
  collapsible: false,
  expanded: false
};

export default ListItem;
