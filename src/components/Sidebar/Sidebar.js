import React from 'react';
import './Sidebar.css';
import FindAddress from '../dart-board/FindAddress'

class Sidebar extends React.Component {
  render() {
    return (
      <div id="sideBar" className="side-bar side-bar--with-border side-bar--open">
        <div className="side-bar__padder">
          Data and services provided by <a href="http://gis.utah.gov">Utah AGRC</a>
          <p>Click a location on the map for more information</p>

          <h4>Find Address</h4>
          <div id="geocodeNode">
            <FindAddress apiKey="AGRC-Explorer" wkid="26912" />
          </div>

          <h4>Find Point of Interest</h4>
          <div id="gnisNode"></div>

          <h4>Find City</h4>
          <div id="cityNode"></div>

          <div className="panel panel-default">
            <div className="panel-heading" role="tab">
              <h4 className="panel-title">
                <a role="button" data-toggle="collapse" data-target="#collapseExport" className="collapsed">
                  Export Map
            </a>
              </h4>
            </div>
            <div id="collapseExport" className="panel-collapse collapse" role="tabpanel">
              <div className="panel-body">
                <div id="printDiv"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Sidebar;
