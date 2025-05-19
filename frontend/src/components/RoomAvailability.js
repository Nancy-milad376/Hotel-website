import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './RoomAvailability.css';

const RoomAvailability = () => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roomTypeLabels = {
    honeymoon: 'Honeymoon Suite',
    family: 'Family Suite',
    panoramic: 'Ocean View Room',
    exclusive: 'Luxury Suite',
    deluxe: 'Deluxe Single Room',
    presidential: 'Presidential Suite'
  };

  const handleCheckAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Format dates for the API
      const formattedCheckIn = checkInDate.toISOString().split('T')[0];
      const formattedCheckOut = checkOutDate.toISOString().split('T')[0];
      
      // Call the API to get availability data
      const response = await axios.get(`/api/inventory/availability?checkInDate=${formattedCheckIn}&checkOutDate=${formattedCheckOut}`);
      
      setAvailabilityData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability. Please try again later.');
      setLoading(false);
    }
  };

  const handleDateChange = (date, type) => {
    if (type === 'checkIn') {
      setCheckInDate(date);
      // Ensure checkout is after checkin
      if (date >= checkOutDate) {
        const newCheckOut = new Date(date);
        newCheckOut.setDate(date.getDate() + 1);
        setCheckOutDate(newCheckOut);
      }
    } else {
      setCheckOutDate(date);
    }
  };

  return (
    <div className="room-availability-container">
      <h2>Check Room Availability</h2>
      
      <div className="availability-form">
        <div className="date-picker-container">
          <div className="date-picker">
            <label>Check-in Date</label>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => handleDateChange(date, 'checkIn')}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          
          <div className="date-picker">
            <label>Check-out Date</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => handleDateChange(date, 'checkOut')}
              minDate={new Date(checkInDate.getTime() + 86400000)} // 1 day after check-in
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>
        
        <button 
          className="availability-btn" 
          onClick={handleCheckAvailability}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Availability'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {availabilityData && !error && (
        <div className="availability-results">
          <h3>Room Availability for Selected Dates</h3>
          <div className="room-types-grid">
            {Object.keys(availabilityData).map((roomType) => {
              const room = availabilityData[roomType];
              return (
                <div 
                  key={roomType} 
                  className={`room-availability-card ${room.available ? 'available' : 'unavailable'}`}
                >
                  <h4>{roomTypeLabels[roomType] || roomType}</h4>
                  {room.available ? (
                    <div className="availability-info">
                      <p className="available-rooms">
                        <span className="availability-count">{room.availableRooms}</span> rooms available
                      </p>
                      <p className="total-rooms">out of {room.totalRooms} total</p>
                    </div>
                  ) : (
                    <p className="not-available">No rooms available</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAvailability;
