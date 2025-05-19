import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setTimeout(() => {
          setReviews([
            {
              id: 1,
              name: "Sarah Johnson",
              rating: 5,
              date: "2025-03-15",
              comment:
                "Absolutely amazing experience! The staff was incredibly attentive and the facilities were top-notch. The beachfront view from our room was breathtaking.",
              image: "/assets/images/review-2.png",
            },
            {
              id: 2,
              name: "Michael Chen",
              rating: 4,
              date: "2025-02-28",
              comment:
                "Great hotel with excellent amenities. The spa services were exceptional and the restaurant offered delicious food. Only drawback was the slightly delayed check-in.",
              image: "/assets/images/review-5.png",
            },
            {
              id: 3,
              name: "Emily Rodriguez",
              rating: 5,
              date: "2025-04-05",
              comment:
                "Perfect getaway destination! The rooms were spacious and immaculately clean. The private beach access was a highlight of our stay. Will definitely return!",
              image: "/assets/images/review-4.png",
            },
            {
              id: 4,
              name: "David Thompson",
              rating: 5,
              date: "2025-03-22",
              comment:
                "Exceptional service from the moment we arrived. The staff went above and beyond to make our anniversary special. The ocean view suite was worth every penny!",
              image: "/assets/images/review-3.png",
            },
            {
              id: 5,
              name: "Sophia Martinez",
              rating: 4,
              date: "2025-04-10",
              comment:
                "Lovely property with beautiful grounds. The pools were amazing and the beach pristine. Restaurant options were good but could use more variety for vegetarians.",
              image: "/assets/images/review-6.png",
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newReview.name.trim()) errors.name = "Name is required";
    if (!newReview.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newReview.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!newReview.comment.trim())
      errors.comment = "Please share your feedback";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newReviewObj = {
        id: reviews.length + 1,
        name: newReview.name,
        rating: parseInt(newReview.rating),
        date: new Date().toISOString().split("T")[0],
        comment: newReview.comment,
        image: "/assets/images/person-default.jpg",
      };
      setReviews([newReviewObj, ...reviews]);
      setNewReview({ name: "", email: "", rating: 5, comment: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
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
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    return stars;
  };

  return (
    <section className="review" id="review">
      <h1 className="heading">Guest Reviews</h1>

      <div className="review-container">
        {/* Slider with background */}
        <div
          className="review-slider-container"
          style={{
            backgroundImage: `url(/assets/images/review-background.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            padding: "2rem",
          }}
        >
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{ delay: 7500, disableOnInteraction: false }}
              pagination={{ el: ".swiper-pagination", clickable: true }}
              loop={true}
              modules={[Pagination, Autoplay]}
              className="review-slider"
            >
              {reviews.map((review) => (
                <SwiperSlide key={review.id} className="slide">
                  <i className="fas fa-quote-left"></i>
                  <p>{review.comment}</p>
                  <div className="stars">{renderStars(review.rating)}</div>
                  <div className="user">
                    <img src={review.image} alt={review.name} />
                    <div className="user-info">
                      <h3>{review.name}</h3>
                      <span>{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              <div className="swiper-pagination"></div>
            </Swiper>
          )}
        </div>

        {/* Reviews list */}
        <div className="reviews-list">
          <h2>All Reviews</h2>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="review-cards">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer">
                      <img src={review.image} alt={review.name} />
                      <div className="reviewer-info">
                        <h3>{review.name}</h3>
                        <span>
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="stars">{renderStars(review.rating)}</div>
                  </div>
                  <div className="review-body">
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add review form */}
        <div className="add-review">
          <h2>Share Your Experience</h2>
          {showSuccess && (
            <div className="alert alert-success">
              Thank you for your review! It has been submitted successfully.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Your Name <span>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newReview.name}
                onChange={handleInputChange}
                className={`form-control ${formErrors.name ? "error" : ""}`}
              />
              {formErrors.name && (
                <div className="error-message">{formErrors.name}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">
                Your Email <span>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newReview.email}
                onChange={handleInputChange}
                className={`form-control ${formErrors.email ? "error" : ""}`}
              />
              {formErrors.email && (
                <div className="error-message">{formErrors.email}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <div className="rating-selector">
                <select
                  id="rating"
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="comment">
                Your Review <span>*</span>
              </label>
              <textarea
                id="comment"
                name="comment"
                rows="5"
                value={newReview.comment}
                onChange={handleInputChange}
                className={`form-control ${formErrors.comment ? "error" : ""}`}
                placeholder="Share your experience with us..."
              ></textarea>
              {formErrors.comment && (
                <div className="error-message">{formErrors.comment}</div>
              )}
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
