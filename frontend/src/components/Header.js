import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when navigating to a new page
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="logo">
        <img src="/assets/images/logo.jpeg" alt="Savoy Hotel Logo" />
      </Link>

      <div 
        className={`menu-btn ${menuOpen ? 'fa-times' : 'fa-bars'}`} 
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </div>

      <nav className={`navbar ${menuOpen ? 'active' : ''}`}>
        <Link to="/">home</Link>
        <Link to="/about">about</Link>
        <Link to="/rooms">rooms</Link>
        <Link to="/gallery">gallery</Link>
        <Link to="/reviews">reviews</Link>
        <Link to="/faq">faq</Link>
        <Link to="/reservation" className="btn">book now</Link>
        <Link to="/cart" className="cart-icon">
          <i className="fas fa-shopping-cart"></i>
          {cartItems.length > 0 && (
            <span className="cart-count">{cartItems.length}</span>
          )}
        </Link>
      </nav>
    </header>
  );
};

export default Header;
