import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import DatePicker from "react-datepicker";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingForm.css";

const BookingForm = ({ selectedRoom = null, onRoomAvailable = () => {} }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [roomType, setRoomType] = useState(
    selectedRoom ? selectedRoom.type : ""
  );
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { addToCart } = useCart();

  const roomTypeLabels = {
    honeymoon: "Honeymoon Suite",
    family: "Family Suite",
    panoramic: "Ocean View Room",
    exclusive: "Luxury Suite",
    deluxe: "Deluxe Single Room",
    presidential: "Presidential Suite",
  };

  // Load available room types on component mount
  useEffect(() => {
    if (selectedRoom) {
      // If a room is pre-selected, use that
      setRoomType(selectedRoom.type);
    } else {
      checkAvailability();
    }
  }, [selectedRoom]);

  const handleCheckAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      // format dates from your inputs
      const formattedCheckIn = checkInDate;
      const formattedCheckOut = checkOutDate;

      // 1) ping health-check (now exists)
      await axios.get("/api/health-check");

      // 2) call your real availability API:
      const { data } = await axios.get("/api/rooms/with-availability", {
        params: {
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
        },
      });
      console.log("Room availability response:", data);
      // find this room’s entry
      const me = data.find((r) => r.id === selectedRoom.id);
      console.log("Availability check response:", me);
      if (!me || !me.availability) {
        throw new Error("This room is fully booked for those dates.");
      }

      // if you have a parent callback to actually “reserve”
      onRoomAvailable && onRoomAvailable(me);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      // Format dates for the API
      const formattedCheckIn = checkInDate.toISOString().split("T")[0];
      const formattedCheckOut = checkOutDate.toISOString().split("T")[0];

      // Call the API to get availability data
      const response = await axios.get(
        `/api/inventory/availability?checkInDate=${formattedCheckIn}&checkOutDate=${formattedCheckOut}`
      );

      setAvailabilityData(response.data);

      // Filter room types that are available
      const availableTypes = Object.keys(response.data).filter(
        (type) =>
          response.data[type].available &&
          response.data[type].availableRooms >= numberOfRooms
      );

      setAvailableRoomTypes(availableTypes);

      // If the selected room is not available, reset the selection
      if (
        roomType &&
        (!response.data[roomType] ||
          !response.data[roomType].available ||
          response.data[roomType].availableRooms < numberOfRooms)
      ) {
        setRoomType(availableTypes.length > 0 ? availableTypes[0] : "");
      } else if (!roomType && availableTypes.length > 0) {
        // If no room is selected yet, select the first available one
        setRoomType(availableTypes[0]);
      }

      return response.data;
    } catch (error) {
      console.error("Error in checkAvailability:", error);
      throw error;
    }
  };

  const handleDateChange = (date, type) => {
    if (type === "checkIn") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage("");

      // Check availability one more time before booking
      const availability = await checkAvailability();

      if (
        !roomType ||
        !availability[roomType] ||
        !availability[roomType].available ||
        availability[roomType].availableRooms < numberOfRooms
      ) {
        setError(
          `Sorry, the selected room type is no longer available for your dates. Please select a different room or dates.`
        );
        setLoading(false);
        return;
      }

      // Calculate the number of nights
      const nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // If we have availability, construct the room object with selected details
      const room = {
        id: Date.now(), // Use a timestamp as a temporary ID
        type: roomType,
        name: roomTypeLabels[roomType] || roomType,
        price: getRoomPrice(roomType),
        image: `/images/rooms/${roomType}.jpg`,
        quantity: numberOfRooms,
        checkInDate: checkInDate.toISOString().split("T")[0],
        checkOutDate: checkOutDate.toISOString().split("T")[0],
        nights: nights,
      };

      // Add to cart
      addToCart(room);

      setSuccessMessage("Room added to your cart!");
      onRoomAvailable(room);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting booking:", error);
      setError("Failed to process your booking. Please try again later.");
      setLoading(false);
    }
  };

  // Helper function to get room prices
  const getRoomPrice = (type) => {
    const prices = {
      honeymoon: 250,
      family: 200,
      panoramic: 180,
      exclusive: 300,
      deluxe: 150,
      presidential: 500,
    };

    return prices[type] || 200;
  };

  return (
    <div className="booking-form-container">
      <h2>Book Your Stay</h2>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Check-in Date</label>
            <DatePicker
              selected={checkInDate}
              onChange={(date) => handleDateChange(date, "checkIn")}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              className="date-input"
            />
          </div>

          <div className="form-group">
            <label>Check-out Date</label>
            <DatePicker
              selected={checkOutDate}
              onChange={(date) => handleDateChange(date, "checkOut")}
              minDate={new Date(checkInDate.getTime() + 86400000)} // 1 day after check-in
              dateFormat="yyyy-MM-dd"
              className="date-input"
            />
          </div>

          <div className="form-group">
            <label>Number of Rooms</label>
            <select
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(parseInt(e.target.value))}
              className="select-input"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Number of Guests</label>
            <select
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
              className="select-input"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group check-availability">
          <button
            type="button"
            onClick={handleCheckAvailability}
            className="check-btn"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Availability"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {availabilityData && availableRoomTypes.length > 0 && (
          <div className="room-selection">
            <div className="form-group">
              <label>Select Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="select-input"
              >
                {availableRoomTypes.map((type) => (
                  <option key={type} value={type}>
                    {roomTypeLabels[type] || type} - ${getRoomPrice(type)}/night
                    ({availabilityData[type].availableRooms} available)
                  </option>
                ))}
              </select>
            </div>

            {roomType && (
              <div className="room-details">
                <h3>{roomTypeLabels[roomType] || roomType}</h3>
                <p className="price">${getRoomPrice(roomType)} per night</p>
                <p className="availability">
                  {availabilityData[roomType]?.availableRooms || 0} rooms
                  available for your dates
                </p>
              </div>
            )}

            <button
              type="submit"
              className="book-btn"
              disabled={loading || !roomType || availableRoomTypes.length === 0}
            >
              {loading ? "Processing..." : "Add to Cart"}
            </button>
          </div>
        )}

        {availabilityData && availableRoomTypes.length === 0 && (
          <div className="no-availability">
            <p>
              Sorry, there are no rooms available for your selected dates.
              Please try different dates.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
