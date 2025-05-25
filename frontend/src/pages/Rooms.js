import React, { useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper";
import { useCart } from "../context/CartContext";
import RoomAvailability from "../components/RoomAvailability";
import BookingForm from "../components/BookingForm";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Rooms.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("/api/rooms/with-availability", {
          params: { checkIn: dates.checkIn, checkOut: dates.checkOut },
        });

        const validatedRooms = response.data.map((room) => {
          const rawPrice = parseFloat(room.price) || 0;
          return {
            id: room.id,
            name: room.name,
            description: room.description || "No description",
            price: `$${rawPrice.toFixed(2)}`,
            image: room.mainImage || "/default-room.jpg",
            features: room.features || [],
            rating: room.rating || 0,
            availableRooms: room.availableRooms,
            availability: room.availableRooms > 0,
          };
        });

        setRooms(validatedRooms);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [dates]);

  const handleDatesChange = (newDates) => {
    setDates({
      checkIn: newDates.checkIn,
      checkOut: newDates.checkOut,
    });
  };

  const handleAddToCart = async (room) => {
    try {
      const response = await axios.post("http://localhost:5000/api/bookings", {
        roomId: room.id,
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut,
      });

      if (response.data.success) {
        addToCart({
          ...room,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          quantity: 1,
        });

        const newResponse = await axios.get(
          "http://localhost:5000/api/rooms/with-availability",
          {
            params: dates,
          }
        );
        setRooms(newResponse.data);
        alert("Room added to cart!");
      }
    } catch (error) {
      alert(
        "Booking failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom({
      id: room.id,
      name: room.name,
      type: getRoomType(room.name),
      price: room.price,
      image: room.image,
    });
    setShowBookingForm(true);
    document
      .getElementById("booking-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  const getRoomType = (roomName) => {
    const typeMap = {
      "Luxury Suite": "exclusive",
      "Ocean View Room": "panoramic",
      "Family Suite": "family",
      "Honeymoon Suite": "honeymoon",
      "Deluxe Single Room": "deluxe",
      "Presidential Suite": "presidential",
    };
    return typeMap[roomName] || "exclusive";
  };

  const handleBookingComplete = (bookingDetails) => {
    setShowBookingForm(false);
    alert(`Your booking for ${bookingDetails.name} has been confirmed!`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }

    const remaining = 5 - Math.ceil(rating);
    for (let i = 0; i < remaining; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <section className="room" id="room">
      <h1 className="heading">Our Rooms</h1>
      <RoomAvailability onDatesChange={handleDatesChange} />

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading available rooms...</p>
        </div>
      ) : (
        <>
          {rooms.length === 0 ? (
            <div className="no-rooms-found">
              <h3>No rooms available for selected dates</h3>
              <p>Please try different dates or contact our reservations team</p>
            </div>
          ) : (
            <Swiper
              spaceBetween={20}
              grabCursor={false}
              loop={true}
              centeredSlides={false}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ el: ".swiper-pagination", clickable: true }}
              navigation={{
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                991: { slidesPerView: 3 },
              }}
              modules={[Pagination, Navigation, Autoplay]}
              className="room-slider"
            >
              {rooms.map((room) => (
                <SwiperSlide
                  key={room.id}
                  className={`slide equal-height ${
                    !room.availability ? "unavailable-room" : ""
                  }`}
                >
                  <div className="image">
                    <span className="price">{room.price}/night</span>
                    {room.availability ? (
                      <button
                        onClick={() => handleAddToCart(room)}
                        className="cart-btn"
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    ) : (
                      <span className="no-availability-badge">
                        {room.availableRooms > 0
                          ? `Only ${room.availableRooms} left`
                          : "Sold out"}
                      </span>
                    )}
                    <img
                      src={room.image}
                      alt={room.name}
                      onError={(e) => {
                        e.target.src = "/default-room.jpg";
                      }}
                    />
                  </div>
                  <div className="content">
                    <h3>{room.name}</h3>
                    <p>{room.description}</p>
                    <div className="features">
                      <h4>Features:</h4>
                      <ul>
                        {room.features.map((f, i) => (
                          <li key={i}>
                            <i className="fas fa-check"></i> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="stars">{renderStars(room.rating)}</div>
                    <button
                      onClick={() => handleBookRoom(room)}
                      className="btn"
                      disabled={!room.availability}
                    >
                      {room.availability ? "Book Now" : "Unavailable"}
                    </button>
                  </div>
                </SwiperSlide>
              ))}
              <div className="swiper-pagination"></div>
              <div className="swiper-button-next"></div>
              <div className="swiper-button-prev"></div>
            </Swiper>
          )}
        </>
      )}

      <div id="booking-section" className="booking-section">
        {showBookingForm && (
          <>
            <h2 className="subheading">Complete Your Booking</h2>
            <BookingForm
              selectedRoom={selectedRoom}
              checkInDate={dates.checkIn}
              checkOutDate={dates.checkOut}
              // 🎯 New callback prop:
              onRoomAvailable={(roomInfo) => {
                // 1) Add to cart
                addToCart({
                  id: roomInfo.id,
                  name: roomInfo.name,
                  price: roomInfo.price,
                  image: roomInfo.image || "/default-room.jpg",
                  nights:
                    (new Date(dates.checkOut) - new Date(dates.checkIn)) /
                    (1000 * 60 * 60 * 24),
                  quantity: 1,
                  checkIn: dates.checkIn,
                  checkOut: dates.checkOut,
                });

                // 2) Give user feedback
                alert(`${roomInfo.name} has been added to your cart!`);

                // 3) Close booking form
                setShowBookingForm(false);

                // 4) Re-fetch availability/list
                //    (trigger useEffect by bumping dates or forceReload state)
                setDates({ ...dates });
              }}
            />
          </>
        )}
      </div>

      <div className="room-grid">
        <h2 className="subheading">All Available Rooms</h2>
        <div className="rooms-container">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`room-card ${
                !room.availability ? "unavailable-room" : ""
              }`}
            >
              <div className="image">
                <span className="price">{room.price}/night</span>
                {room.availability ? (
                  <button
                    onClick={() => handleAddToCart(room)}
                    className="cart-btn"
                  >
                    <i className="fas fa-shopping-cart"></i>
                  </button>
                ) : (
                  <span className="no-availability-badge">
                    {room.availableRooms > 0
                      ? `Only ${room.availableRooms} left`
                      : "Sold out"}
                  </span>
                )}
                <img
                  src={room.image}
                  alt={room.name}
                  onError={(e) => {
                    e.target.src = "/default-room.jpg";
                  }}
                />
              </div>
              <div className="content">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className="features">
                  <h4>Features:</h4>
                  <ul>
                    {room.features.map((f, i) => (
                      <li key={i}>
                        <i className="fas fa-check"></i> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="stars">{renderStars(room.rating)}</div>
                <button
                  onClick={() => handleBookRoom(room)}
                  className="btn"
                  disabled={!room.availability}
                >
                  {room.availability ? "Book Now" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rooms;
