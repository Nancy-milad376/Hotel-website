import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Reservation.css';

const Reservation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkInDate: null,
    checkOutDate: null,
    roomType: 'exclusive',
    adults: '1',
    children: '0',
    rooms: '1',
    specialRequests: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date
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
    const requiredFields = ['name', 'email', 'phone', 'checkInDate', 'checkOutDate'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Check-in date validation
    if (formData.checkInDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (formData.checkInDate < today) {
        newErrors.checkInDate = 'Check-in date cannot be in the past';
      }
    }
    
    // Check-out date validation
    if (formData.checkInDate && formData.checkOutDate) {
      if (formData.checkOutDate <= formData.checkInDate) {
        newErrors.checkOutDate = 'Check-out date must be after check-in date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to the backend
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to rooms page to select a room
      navigate('/rooms', { 
        state: { 
          reservationDetails: formData,
          message: 'Please select a room to complete your reservation' 
        } 
      });
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setErrors({
        form: 'There was an error processing your request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate minimum checkout date (day after checkin)
  const minCheckoutDate = formData.checkInDate 
    ? new Date(formData.checkInDate.getTime() + 86400000) 
    : new Date();
  
  // Calculate minimum checkin date (today)
  const minCheckinDate = new Date();
  
  return (
    <section className="reservation" id="reservation">
      <h1 className="heading">Make a Reservation</h1>
      
      {errors.form && (
        <div className="alert alert-danger">{errors.form}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="container">
          <div className="form-section">
            <h2>Guest Information</h2>
            
            <div className="box">
              <label htmlFor="name">Full Name <span>*</span></label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                className={`input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="box">
              <label htmlFor="email">Email Address <span>*</span></label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className={`input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="box">
              <label htmlFor="phone">Phone Number <span>*</span></label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                className={`input ${errors.phone ? 'error' : ''}`}
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
          </div>
          
          <div className="form-section">
            <h2>Reservation Details</h2>
            
            <div className="date-row">
              <div className="box">
                <label htmlFor="checkInDate">Check-in Date <span>*</span></label>
                <DatePicker
                  id="checkInDate"
                  name="checkInDate"
                  selected={formData.checkInDate}
                  onChange={(date) => handleDateChange(date, 'checkInDate')}
                  minDate={minCheckinDate}
                  dateFormat="dd/MM/yyyy"
                  className={`input ${errors.checkInDate ? 'error' : ''}`}
                  placeholderText="Select date"
                />
                {errors.checkInDate && <div className="error-message">{errors.checkInDate}</div>}
              </div>
              
              <div className="box">
                <label htmlFor="checkOutDate">Check-out Date <span>*</span></label>
                <DatePicker
                  id="checkOutDate"
                  name="checkOutDate"
                  selected={formData.checkOutDate}
                  onChange={(date) => handleDateChange(date, 'checkOutDate')}
                  minDate={minCheckoutDate}
                  dateFormat="dd/MM/yyyy"
                  className={`input ${errors.checkOutDate ? 'error' : ''}`}
                  placeholderText="Select date"
                  disabled={!formData.checkInDate}
                />
                {errors.checkOutDate && <div className="error-message">{errors.checkOutDate}</div>}
              </div>
            </div>
            
            <div className="box">
              <label htmlFor="roomType">Room Type</label>
              <select 
                id="roomType" 
                name="roomType" 
                className="input"
                value={formData.roomType}
                onChange={handleChange}
              >
                <option value="exclusive">Exclusive Rooms</option>
                <option value="family">Family Rooms</option>
                <option value="deluxe">Deluxe Rooms</option>
                <option value="panoramic">Panoramic Rooms</option>
                <option value="presidential">Presidential Suite</option>
                <option value="honeymoon">Honeymoon Suite</option>
              </select>
            </div>
            
            <div className="options-row">
              <div className="box">
                <label htmlFor="adults">Adults</label>
                <select 
                  id="adults" 
                  name="adults" 
                  className="input"
                  value={formData.adults}
                  onChange={handleChange}
                >
                  <option value="1">1 adult</option>
                  <option value="2">2 adults</option>
                  <option value="3">3 adults</option>
                  <option value="4">4 adults</option>
                  <option value="5">5 adults</option>
                  <option value="6">6 adults</option>
                </select>
              </div>
              
              <div className="box">
                <label htmlFor="children">Children</label>
                <select 
                  id="children" 
                  name="children" 
                  className="input"
                  value={formData.children}
                  onChange={handleChange}
                >
                  <option value="0">0 children</option>
                  <option value="1">1 child</option>
                  <option value="2">2 children</option>
                  <option value="3">3 children</option>
                  <option value="4">4 children</option>
                </select>
              </div>
              
              <div className="box">
                <label htmlFor="rooms">Rooms</label>
                <select 
                  id="rooms" 
                  name="rooms" 
                  className="input"
                  value={formData.rooms}
                  onChange={handleChange}
                >
                  <option value="1">1 room</option>
                  <option value="2">2 rooms</option>
                  <option value="3">3 rooms</option>
                  <option value="4">4 rooms</option>
                  <option value="5">5 rooms</option>
                  <option value="6">6 rooms</option>
                </select>
              </div>
            </div>
            
            <div className="box">
              <label htmlFor="specialRequests">Special Requests</label>
              <textarea 
                id="specialRequests" 
                name="specialRequests" 
                className="input"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="5"
                placeholder="Any special requests or considerations..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Check Availability'}
        </button>
      </form>
      
      <div className="reservation-info">
        <h2>Reservation Information</h2>
        <div className="info-content">
          <div className="info-item">
            <h3><i className="fas fa-calendar-check"></i> Check-in Time</h3>
            <p>3:00 PM onwards</p>
          </div>
          
          <div className="info-item">
            <h3><i className="fas fa-calendar-times"></i> Check-out Time</h3>
            <p>Until 12:00 PM</p>
          </div>
          
          <div className="info-item">
            <h3><i className="fas fa-credit-card"></i> Payment</h3>
            <p>We accept all major credit cards and cash. A valid credit card is required to guarantee your reservation.</p>
          </div>
          
          <div className="info-item">
            <h3><i className="fas fa-ban"></i> Cancellation Policy</h3>
            <p>Free cancellation up to 48 hours before arrival. Late cancellations or no-shows may be charged one night's stay.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;
