import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RoomAvailability.css";

const RoomAvailability = ({ onDatesChange }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      // Basic validation
      if (!checkInDate || !checkOutDate) {
        throw new Error("Please select both check-in and check-out dates");
      }
      if (checkInDate >= checkOutDate) {
        throw new Error("Check-out date must be after check-in date");
      }

      // Format dates as YYYY-MM-DD
      const formattedCheckIn = checkInDate.toISOString().slice(0, 10);
      const formattedCheckOut = checkOutDate.toISOString().slice(0, 10);

      // Tell the parent (Rooms) about the new dates so it can re-fetch rooms
      onDatesChange({
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date, type) => {
    const zeroTime = (d) => {
      d.setHours(0, 0, 0, 0);
      return d;
    };
    const d = zeroTime(new Date(date));

    if (type === "checkIn") {
      setCheckInDate(d);
      // auto-bump checkout if necessary
      if (d >= checkOutDate) {
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        setCheckOutDate(zeroTime(next));
      }
    } else {
      setCheckOutDate(d);
    }
  };

  return (
    <div className="room-availability-container">
      <h2>Check Room Availability</h2>
      <div className="availability-controls">
        <div className="date-picker-group">
          <div className="date-picker-wrapper">
            <label>Check-in Date</label>
            <DatePicker
              selected={checkInDate}
              onChange={(d) => handleDateChange(d, "checkIn")}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              className="date-input"
              popperPlacement="bottom-start"
            />
          </div>
          <div className="date-picker-wrapper">
            <label>Check-out Date</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(d) => handleDateChange(d, "checkOut")}
              minDate={new Date(checkInDate.getTime() + 86400000)}
              dateFormat="MMMM d, yyyy"
              className="date-input"
              popperPlacement="bottom-start"
            />
          </div>
        </div>
        <button
          className={`availability-btn ${loading ? "loading" : ""}`}
          onClick={handleCheckAvailability}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Checking...
            </>
          ) : (
            "Check Availability"
          )}
        </button>
      </div>
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle" /> {error}
        </div>
      )}
    </div>
  );
};

export default RoomAvailability;
