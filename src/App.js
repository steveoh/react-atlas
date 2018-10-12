import React, { Component } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapLens from './components/MapLens';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Header title="Atlas Utah" version="4.0.0"/>
        <Sidebar />
        <MapLens />
      </div>
    );
  }
}

export default App;
