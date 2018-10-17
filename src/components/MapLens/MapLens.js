import React, { Component } from 'react';
import './MapLens.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'reactstrap';

export default class MapLens extends Component {
  state = {
    sideBarOpen: true
  }

  toggleSidebar = this.toggleSidebar.bind(this);

  render() {
    return (
      <div id="centerContainer" className={'map-lens map-lens--with-border ' + (this.state.sideBarOpen ? 'map-lens--side-bar-open' : '')}>
        <Button size="sm" color="info" className="map-lens__sidebar btn btn-default btn-xs" onClick={this.toggleSidebar}>
          <FontAwesomeIcon icon={faChevronLeft} size="xs" flip={this.state.sideBarOpen ? null : 'horizontal'} />
        </Button>
        {this.props.children}
      </div>
    );
  }

  toggleSidebar() {
    this.setState(state => {
      return { sideBarOpen: !state.sideBarOpen };
    });
  }
}
