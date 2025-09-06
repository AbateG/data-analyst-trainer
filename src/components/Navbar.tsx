import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/">Data Detective</NavLink>
      </div>
      <ul className="navbar-nav">
        <li>
          <NavLink to="/sql" className={({ isActive }) => (isActive ? 'active' : '')}>
            SQL Challenges
          </NavLink>
        </li>
        <li>
          <NavLink to="/python" className={({ isActive }) => (isActive ? 'active' : '')}>
            Python Challenges
          </NavLink>
        </li>
        <li>
          <NavLink to="/conceptual" className={({ isActive }) => (isActive ? 'active' : '')}>
            Conceptual Questions
          </NavLink>
        </li>
      </ul>
      <ul className="navbar-nav" style={{marginLeft:'auto'}}>
        <li>
          <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
            Progress
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
