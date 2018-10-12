import React from 'react';
import './Header.css';
import logo from './agrc_logo.jpg';

class Header extends React.Component {
  render() {
    return (
      <div className="app__header">
        <h1 className="header__heading">
          <span>{this.props.title}</span>
          <a className="heading__version" href="ChangeLog.html" target="_blank" rel="noopener">{this.props.version}</a>
        </h1>
        <img src={logo} className="heading__img" alt="agrc logo" />
      </div>
    )
  }
}

export default Header;
