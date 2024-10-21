import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import { TabState } from './Tournament';

interface TabViewProps {
  currentTab: TabState;
  setCurrentTab: (tab: TabState) => void;
}

const TabView: React.FC<TabViewProps> = ({
  currentTab,
  setCurrentTab
}) => {
  const toggleTab = (tab: TabState) => {
    if (currentTab !== tab) setCurrentTab(tab);
  };

  return (
    <Nav
      tabs
      style={{
        cursor: 'pointer',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <NavItem style={{ flex: 1 }}>
        <NavLink
          className={classnames({ active: currentTab === TabState.Upcoming })}
          onClick={() => toggleTab(TabState.Upcoming)}
          style={{
            color: 'black',
            background: currentTab === TabState.Upcoming ? 'white' : 'transparent',
            borderRadius: '15px',
            textAlign: 'center',
          }}
        >
          Upcoming
        </NavLink>
      </NavItem>

      <NavItem style={{ flex: 1 }}>
        <NavLink
          className={classnames({ active: currentTab === TabState.Ongoing })}
          onClick={() => toggleTab(TabState.Ongoing)}
          style={{
            color: 'black',
            background: currentTab === TabState.Ongoing ? 'white' : 'transparent',
            borderRadius: '15px',
            textAlign: 'center',
          }}
        >
          Ongoing
        </NavLink>
      </NavItem>

      <NavItem style={{ flex: 1 }}>
        <NavLink
          className={classnames({ active: currentTab === TabState.Finished })}
          onClick={() => toggleTab(TabState.Finished)}
          style={{
            color: 'black',
            background: currentTab === TabState.Finished ? 'white' : 'transparent',
            borderRadius: '15px',
            textAlign: 'center',
          }}
        >
          Finished
        </NavLink>
      </NavItem>
    </Nav>
  );
};

export default TabView;
