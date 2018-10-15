import React, { Component } from 'react';
import './Sidebar.css';

export default class Sidebar extends Component {
  render() {
    return (
      <div id="sideBar" className="side-bar side-bar--with-border side-bar--open">
        <div className="side-bar__padder">
          {this.props.children}
        </div>
      </div>
    )
  }
}
