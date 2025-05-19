import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper";
import { useCart } from "../context/CartContext";
import RoomAvailability from "../components/RoomAvailability";
import BookingForm from "../components/BookingForm";
import {
  initializeInventory,
  getAvailableRoomCount,
  isRoomAvailable,
  reserveRoom,
} from "../utils/inventoryManager";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Rooms.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    // Initialize the inventory system
    initializeInventory();

    // Fetch rooms with actual availability
    const fetchRooms = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          // Define basic room data
          const roomsData = [
            {
              id: 1,
              name: "Luxury Suite",
              description:
                "Experience unparalleled luxury with our spacious suites featuring panoramic views of the Red Sea.",
              price: 150,
              image: "/assets/images/room-1.jpg",
              features: [
                "King-size bed",
                "Ocean view",
                "Private balcony",
                "Mini bar",
                "Room service",
              ],
              rating: 5,
            },
            {
              id: 2,
              name: "Ocean View Room",
              description:
                "Wake up to stunning ocean views in our elegantly appointed oceanfront rooms with private balconies.",
              price: 200,
              image: "/assets/images/room-2.jpg",
              features: [
                "Queen-size bed",
                "Ocean view",
                "Private balcony",
                "Mini bar",
              ],
              rating: 4.5,
            },
            {
              id: 3,
              name: "Family Suite",
              description:
                "Perfect for families, our spacious family suites offer separate living areas and stunning views.",
              price: 250,
              image: "/assets/images/room-3.jpg",
              features: [
                "2 King-size beds",
                "Living room",
                "Ocean view",
                "Kitchen area",
                "Game console",
              ],
              rating: 4.8,
            },
            {
              id: 4,
              name: "Deluxe Single Room",
              description:
                "Cozy and comfortable single rooms, perfect for solo travelers seeking luxury and comfort.",
              price: 120,
              image: "/assets/images/room-4.jpg",
              features: ["Single bed", "City view", "Work desk", "Mini bar"],
              rating: 4.3,
            },
            {
              id: 5,
              name: "Presidential Suite",
              description:
                "The ultimate in luxury, our presidential suite offers unparalleled amenities and breathtaking panoramic views.",
              price: 500,
              image: "/assets/images/room-5.jpg",
              features: [
                "Super King-size bed",
                "Living room",
                "Dining area",
                "Jacuzzi",
                "Butler service",
              ],
              rating: 5,
            },
            {
              id: 6,
              name: "Honeymoon Suite",
              description:
                "Designed for romance, our honeymoon suite features a private balcony and stunning sunset views.",
              price: 300,
              image: "/assets/images/room-6.jpg",
              features: [
                "King-size bed",
                "Ocean view",
                "Private hot tub",
                "Champagne service",
                "Couples massage",
              ],
              rating: 4.9,
            },
          ];

          // Enhance room data with availability information
          const roomsWithAvailability = roomsData.map((room) => {
            const availableCount = getAvailableRoomCount(room.id);
            return {
              ...room,
              availability: availableCount > 0,
              availableRooms: availableCount,
            };
          });

          setRooms(roomsWithAvailability);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Function to add room to cart and reserve it in inventory
  const handleAddToCart = (room) => {
    // Check if the room is available
    if (!room.availability) {
      alert(`${room.name} is not available!`);
      return;
    }

    // Calculate nights from today to tomorrow (default 1 night)
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const today = new Date();
    const tomorrow = new Date(today.getTime() + oneDay);
    const diffDays = Math.round(Math.abs((tomorrow - today) / oneDay));

    // Create reservation data
    const quantity = 1; // Default quantity
    const reservationData = {
      roomId: room.id,
      quantity: quantity,
      checkIn: today.toISOString().split("T")[0],
      checkOut: tomorrow.toISOString().split("T")[0],
    };

    // Try to reserve the room
    const reserved = reserveRoom(reservationData);

    if (reserved) {
      // Add to cart
      const roomToAdd = {
        id: room.id,
        name: room.name,
        price: room.price,
        image: room.image,
        nights: diffDays,
        quantity: quantity,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
      };

      addToCart(roomToAdd);
      alert(`${room.name} added to cart!`);

      // Refresh the rooms to update availability
      window.location.reload();
    } else {
      alert(`Sorry, ${room.name} is no longer available.`);
    }
  };

  // Function to handle booking a specific room
  const handleBookRoom = (room) => {
    setSelectedRoom({
      id: room.id,
      name: room.name,
      type: getRoomType(room.name),
      price: room.price,
      image: room.image,
    });
    setShowBookingForm(true);

    // Scroll to booking form
    document
      .getElementById("booking-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  // Function to map room name to room type for the inventory system
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

  // Handle booking completion
  const handleBookingComplete = (bookingDetails) => {
    // Show success message or redirect to another page
    setShowBookingForm(false);
    alert(
      `Your booking for ${bookingDetails.name} has been added to your cart!`
    );
  };

  // Generate stars based on rating
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

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <section className="room" id="room">
      <h1 className="heading">our rooms</h1>

      {/* Room Availability Checker */}
      <RoomAvailability />

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <Swiper
          spaceBetween={20}
          grabCursor={false}
          loop={true}
          centeredSlides={false}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            el: ".swiper-pagination",
            clickable: true,
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            991: {
              slidesPerView: 3,
            },
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
                <span className="price">${room.price}/night</span>
                {room.availability ? (
                  <button
                    onClick={() => handleAddToCart(room)}
                    className="cart-btn"
                  >
                    <i className="fas fa-shopping-cart"></i>
                  </button>
                ) : (
                  <span className="no-availability-badge">Unavailable</span>
                )}
                <img src={room.image} alt={room.name} />
              </div>
              <div className="content">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className="features">
                  <h4>Features:</h4>
                  <ul>
                    {room.features.map((feature, index) => (
                      <li key={index}>
                        <i className="fas fa-check"></i> {feature}
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
                  {room.availability ? "book now" : "unavailable"}
                </button>
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-pagination"></div>
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
        </Swiper>
      )}

      {/* Booking Form Section */}
      <div id="booking-section" className="booking-section">
        {showBookingForm && (
          <>
            <h2 className="subheading">Book Your Room</h2>
            <BookingForm
              selectedRoom={selectedRoom}
              onBookingComplete={handleBookingComplete}
            />
          </>
        )}
      </div>

      <div className="room-grid">
        <h2 className="subheading">All Available Rooms</h2>
        <div className="rooms-container">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className={`room-card ${
                  !room.availability ? "unavailable-room" : ""
                }`}
              >
                <div className="image">
                  <span className="price">${room.price}/night</span>
                  {room.availability ? (
                    <button
                      onClick={() => handleAddToCart(room)}
                      className="cart-btn"
                    >
                      <i className="fas fa-shopping-cart"></i>
                    </button>
                  ) : (
                    <span className="no-availability-badge">Unavailable</span>
                  )}
                  <img src={room.image} alt={room.name} />
                </div>
                <div className="content">
                  <h3>{room.name}</h3>
                  <p>{room.description}</p>
                  <div className="features">
                    <h4>Features:</h4>
                    <ul>
                      {room.features.map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check"></i> {feature}
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
                    {room.availability ? "book now" : "unavailable"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Rooms;
