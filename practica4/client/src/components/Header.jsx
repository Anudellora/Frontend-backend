import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const { pathname } = useLocation();

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          ZVC
        </Link>
        <nav className="header__nav">
          <Link
            to="/"
            className={`header__link ${pathname === '/' ? 'header__link--active' : ''}`}
          >
            Магазин
          </Link>
          <Link
            to="/add"
            className={`header__link ${pathname === '/add' ? 'header__link--active' : ''}`}
          >
            Добавить товар
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
