import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const [theme, setTheme] = React.useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('theme') || 'dark') : 'dark'
  );

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

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
        <li>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            aria-pressed={theme === 'dark' ? 'true' : 'false'}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
