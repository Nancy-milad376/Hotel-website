import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(id, { quantity: newQuantity });
    }
  };
  
  const handleNightsChange = (id, newNights) => {
    const item = cartItems.find(item => item.id === id);
    if (newNights >= 1 && item) {
      // Calculate new checkout date based on check-in date and nights
      const checkInDate = new Date(item.checkInDate);
      const newCheckOutDate = new Date(checkInDate);
      newCheckOutDate.setDate(checkInDate.getDate() + newNights);
      
      updateQuantity(id, { 
        nights: newNights,
        checkOutDate: newCheckOutDate.toISOString().split('T')[0]
      });
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <section className="cart-section empty-cart">
        <h1 className="heading">Your Cart</h1>
        <div className="empty-cart-container">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>You have no items in your shopping cart.<br />Let's go book some rooms!</p>
          <Link to="/rooms" className="btn">Explore Rooms</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-section">
      <h1 className="heading">Your Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-header">
                <h3 className="item-name">{item.name}</h3>
                <button 
                  className="remove-btn" 
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove from cart"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              
              <div className="item-grid">
                <div className="item-section">
                  <div className="item-label">Reservation Dates</div>
                  <div className="item-dates">
                    {item.checkInDate && item.checkOutDate ? (
                      <span>
                        {new Date(item.checkInDate).toLocaleDateString()} to {new Date(item.checkOutDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>Dates not specified</span>
                    )}
                  </div>
                </div>
                
                <div className="item-section">
                  <div className="item-label">Stay Duration</div>
                  <div className="item-quantity">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn" 
                        onClick={() => {
                          // Calculate new checkout date based on checkInDate and reduced nights
                          const currentNights = item.nights || 1;
                          if (currentNights > 1) {
                            // Only proceed if checkInDate exists
                            if (item.checkInDate) {
                              const checkInDate = new Date(item.checkInDate);
                              const newCheckOutDate = new Date(checkInDate);
                              newCheckOutDate.setDate(checkInDate.getDate() + (currentNights - 1));
                              
                              updateQuantity(item.id, { 
                                nights: currentNights - 1,
                                checkOutDate: newCheckOutDate.toISOString().split('T')[0]
                              });
                            } else {
                              // If no check-in date, just update nights
                              updateQuantity(item.id, { 
                                nights: currentNights - 1
                              });
                            }
                          }
                        }}
                        disabled={(item.nights || 1) <= 1}
                        aria-label="Decrease nights"
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="nights-count">{item.nights || 1} {(item.nights || 1) === 1 ? 'night' : 'nights'}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => {
                          // Calculate new checkout date based on checkInDate and increased nights
                          const currentNights = item.nights || 1;
                          // Only proceed with date calculation if checkInDate exists
                          if (item.checkInDate) {
                            const checkInDate = new Date(item.checkInDate);
                            const newCheckOutDate = new Date(checkInDate);
                            newCheckOutDate.setDate(checkInDate.getDate() + (currentNights + 1));
                            
                            updateQuantity(item.id, { 
                              nights: currentNights + 1,
                              checkOutDate: newCheckOutDate.toISOString().split('T')[0]
                            });
                          } else {
                            // If no check-in date, just update nights
                            updateQuantity(item.id, { 
                              nights: currentNights + 1
                            });
                          }
                        }}
                        aria-label="Increase nights"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="item-section">
                  <div className="item-label">Number of Rooms</div>
                  <div className="item-rooms">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease rooms"
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="room-count">{item.quantity} {item.quantity === 1 ? 'room' : 'rooms'}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item.id, { quantity: item.quantity + 1 })}
                        aria-label="Increase rooms"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="item-section">
                  <div className="item-label">Rate</div>
                  <div className="item-price">
                    ${item.price}<span className="per-night">/night</span>
                  </div>
                </div>
              </div>
              
              <div className="item-footer">
                <div className="total-section">
                  <div className="item-label">Total Cost</div>
                  <div className="item-total">
                    ${(item.price * item.quantity * (item.nights || 1)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Reservation Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%):</span>
            <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
          </div>
          <button className="btn checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <button className="btn clear-btn" onClick={clearCart}>
            Clear Cart
          </button>
          <Link to="/rooms" className="continue-shopping">
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cart;
