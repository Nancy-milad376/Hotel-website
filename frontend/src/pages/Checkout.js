import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    checkInDate: '',
    checkOutDate: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    noOfPeople: '1',
    specialRequests: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect to rooms if cart is empty
  if (cartItems.length === 0) {
    navigate('/rooms');
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'country', 'checkInDate', 'checkOutDate'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Check-in date validation
    if (formData.checkInDate) {
      const checkIn = new Date(formData.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (checkIn < today) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
    }
    
    // Check-out date validation
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      
      if (checkOut <= checkIn) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }
    
    // Payment validation
    if (formData.paymentMethod === 'credit') {
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      
      if (!formData.cardName) {
        newErrors.cardName = 'Name on card is required';
      }
      
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please use format MM/YY';
      }
      
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real application, this would be an API call to the backend
      // to process the booking and payment
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and redirect to success page
      clearCart();
      
      // Show confirmation
      alert('Booking successful! Thank you for your reservation.');
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error processing booking:', error);
      setErrors({
        form: 'There was an error processing your booking. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalPrice = getCartTotal();
  const tax = totalPrice * 0.1;
  const grandTotal = totalPrice + tax;
  
  return (
    <section className="checkout-section">
      <h1 className="heading">Checkout</h1>
      
      {errors.form && (
        <div className="alert alert-danger">{errors.form}</div>
      )}
      
      <div className="checkout-container">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Personal Information</h2>
              
              <div className="form-group">
                <label htmlFor="name">Full Name <span>*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email <span>*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone <span>*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-control ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Address Information</h2>
              
              <div className="form-group">
                <label htmlFor="address">Address <span>*</span></label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className={`form-control ${errors.address ? 'error' : ''}`}
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <div className="error-message">{errors.address}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City <span>*</span></label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`form-control ${errors.city ? 'error' : ''}`}
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <div className="error-message">{errors.city}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="country">Country <span>*</span></label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    className={`form-control ${errors.country ? 'error' : ''}`}
                    value={formData.country}
                    onChange={handleChange}
                  />
                  {errors.country && <div className="error-message">{errors.country}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    className="form-control"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Booking Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkInDate">Check-in Date <span>*</span></label>
                  <input
                    type="date"
                    id="checkInDate"
                    name="checkInDate"
                    className={`form-control ${errors.checkInDate ? 'error' : ''}`}
                    value={formData.checkInDate}
                    onChange={handleChange}
                  />
                  {errors.checkInDate && <div className="error-message">{errors.checkInDate}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="checkOutDate">Check-out Date <span>*</span></label>
                  <input
                    type="date"
                    id="checkOutDate"
                    name="checkOutDate"
                    className={`form-control ${errors.checkOutDate ? 'error' : ''}`}
                    value={formData.checkOutDate}
                    onChange={handleChange}
                  />
                  {errors.checkOutDate && <div className="error-message">{errors.checkOutDate}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="noOfPeople">Number of Guests</label>
                <select
                  id="noOfPeople"
                  name="noOfPeople"
                  className="form-control"
                  value={formData.noOfPeople}
                  onChange={handleChange}
                >
                  <option value="1">1 person</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5 people</option>
                  <option value="6">6 people</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  className="form-control"
                  rows="4"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requests or considerations..."
                ></textarea>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Payment Information</h2>
              
              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="credit"
                      name="paymentMethod"
                      value="credit"
                      checked={formData.paymentMethod === 'credit'}
                      onChange={handleChange}
                    />
                    <label htmlFor="credit">Credit / Debit Card</label>
                  </div>
                  
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="payAtHotel"
                      name="paymentMethod"
                      value="payAtHotel"
                      checked={formData.paymentMethod === 'payAtHotel'}
                      onChange={handleChange}
                    />
                    <label htmlFor="payAtHotel">Pay at Hotel</label>
                  </div>
                </div>
              </div>
              
              {formData.paymentMethod === 'credit' && (
                <div className="credit-card-details">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number <span>*</span></label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className={`form-control ${errors.cardNumber ? 'error' : ''}`}
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                    {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardName">Name on Card <span>*</span></label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      className={`form-control ${errors.cardName ? 'error' : ''}`}
                      value={formData.cardName}
                      onChange={handleChange}
                    />
                    {errors.cardName && <div className="error-message">{errors.cardName}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="expiryDate">Expiry Date <span>*</span></label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        className={`form-control ${errors.expiryDate ? 'error' : ''}`}
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && <div className="error-message">{errors.expiryDate}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="cvv">CVV <span>*</span></label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        className={`form-control ${errors.cvv ? 'error' : ''}`}
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                      />
                      {errors.cvv && <div className="error-message">{errors.cvv}</div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Complete Booking'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="cart-items-summary">
            {cartItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>${item.price} x {item.quantity} night{item.quantity > 1 ? 's' : ''}</p>
                </div>
                <div className="item-subtotal">${item.price * item.quantity}</div>
              </div>
            ))}
          </div>
          
          <div className="price-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="booking-details">
            <h3>Your Booking</h3>
            <p><strong>Items:</strong> {cartItems.reduce((total, item) => total + item.quantity, 0)} night(s)</p>
            <p><strong>Rooms:</strong> {cartItems.length}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
