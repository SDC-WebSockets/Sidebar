import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

const host = process.env.PUBLIC_HOST || 'localhost';
const port = process.env.PORT || 3004;
const courseContentURL = process.env.COURSE_CONTENT_URL || 'localhost:9800';
console.log('host: ', host);
console.log(process.env.PUBLIC_HOST);

export const Sidebar = () => {

  // Will match only numbers
  const regex = /\d+/;

  // First, attempts to get the course ID from the URL's pathname. Will match the
  // first number (though only will display something to /course/<number> because
  // also needs the server to be willing to send a file.)
  // If that doesn't work, attempts to match a search in the url (so format e.g.
  // localhost:3004/?courseId=27). Will take the first number it finds after the ?

  let currentCourse;
  if (window.location.pathname.match(regex) === null) {
    if (window.location.search.match(regex) === null) {
      currentCourse = 1;
    }
    else {
      currentCourse = window.location.search.match(regex)[0];
    }
  } else {
    currentCourse = window.location.pathname.match(regex)[0];
  }

  const [ courseId, setCourseId ] = useState(currentCourse);
  const [ priceData, setPriceData ] = useState();
  const [ previewVideoData, setPreviewVideoData ] = useState();
  const [ sidebarData, setSidebarData ] = useState();
  const [ courseData, setCourseData ] = useState();
  const [ couponMenuOpen, setCouponMenuOpen ] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(`http://${host}:${port}/price?courseId=${courseId}`)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setPriceData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch(`http://${host}:${port}/previewVideo?courseId=${courseId}`)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setPreviewVideoData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch(`http://${host}:${port}/sidebar?courseId=${courseId}`)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setSidebarData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch(`http://${courseContentURL}/course/item?courseId=${courseId}`)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setCourseData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    return () => {
      mounted = false;
    }

  }, []);

  let basePrice;
  let discountPercentage;
  let discountedPrice;
  let saleOngoing;

  if (priceData !== undefined) {
     ({basePrice, discountPercentage, discountedPrice, saleOngoing} = priceData);
  }

  let previewVideoUrl;
  let previewVideoImgUrl;

  if (previewVideoData !== undefined) {
    previewVideoUrl = previewVideoData.previewVideoUrl;
    previewVideoImgUrl = previewVideoData.previewVideoImgUrl;
  }

  let fullLifetimeAccess;
  let accessTypes;
  let assignments;
  let certificateOfCompletion;
  let downloadableResources;

  if (sidebarData !== undefined) {
    ({fullLifetimeAccess, accessTypes, assignments, certificateOfCompletion, downloadableResources} = sidebarData);
  }

  let courseLength;
  let totalArticles;
  let totalLectures;
  let totalQuizzes;
  let totalExercises;

  if (courseData !== undefined) {
    ({totalArticles, totalLectures, totalQuizzes, totalExercises, courseLength} = courseData);
    courseLength = DateTime.fromISO(courseLength).toSeconds();
    courseLength = Math.round((courseLength / 3600) * 2) / 2;
  }

  let priceInfo = saleOngoing ?
    <div className="sidebar-price-info">
      <div className="sidebar-big-price sidebar-tight-letters">
        ${discountedPrice}
      </div>
      <div className="sidebar-discount-info">
        $<s>{basePrice}</s> {discountPercentage}% off!
      </div>
    </div> :
    <div className="sidebar-big-price sidebar-tight-letters">${basePrice}</div>;

  let applyCoupon = !couponMenuOpen ?
    <div className="sidebar-coupon sidebar-cursor-pointer sidebar-tight-letters" onClick={() => setCouponMenuOpen(true)}>
      Apply Coupon
    </div> :
    <form onSubmit={(e) => e.preventDefault()}>
      <input className="sidebar-coupon-input" placeholder="Enter Coupon" type="text"></input>
      <button type="submit" className="sidebar-coupon-submit-button sidebar-tight-letters">Apply</button>
    </form>;

  return (
    <div className="sidebar-container">
      <div className="sidebar-container-content">
        <a href={previewVideoUrl}>
          <button className="sidebar-preview-video sidebar-cursor-pointer">
            <img src={previewVideoImgUrl} alt="Preview video image for this class."></img>
            <span className="sidebar-preview-video-overlay-gradient"></span>
            <svg xmlns="http://www.w3.org/2000/svg">
              <g>
                <title>Layer 1</title>
                <ellipse ry="10" rx="10" id="svg_1" cy="219.5" cx="317" stroke="#000" fill="#fff"/>
                <ellipse stroke="#000" strokeWidth="0" ry="32" rx="31.50001" id="svg_2" cy="96" cx="170.37736" fill="#ffffff"/>
                <path transform="rotate(90 172.951 96)" stroke="#000" id="svg_9" d="m161.10466,107.73892l11.84616,-23.47785l11.84616,23.47785l-23.69232,0z" fill="#000000"/>
              </g>
            </svg>
            <span className="sidebar-preview-video-overlay-text sidebar-tight-letters">Preview this course</span>
          </button>
        </a>
        <div className="sidebar-main-content">
          {priceInfo}
          <div className="sidebar-button-container">
            <button className="sidebar-add-to-cart-button sidebar-cursor-pointer sidebar-tight-letters">Add to cart</button>
            <button className="sidebar-buy-now-button sidebar-cursor-pointer sidebar-tight-letters">Buy now</button>
            <p>30-Day Money-Back Guarantee</p>
          </div>
          <div className="sidebar-course-includes">
            <b className="sidebar-tight-letters">This course includes:</b>
            {courseLength > 0 &&
              <div className="sidebar-course-includes-item">
                <div className="sidebar-small-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 3H3c-1.11 0-2 .89-2 2v12a2 2 0 002 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 00-2-2zm0 14H3V5h18v12zm-5-6l-7 4V7l7 4z"></path>
                  </svg>
                </div>
                <div className="sidebar-course-includes-text">
                  {courseLength} hours on-demand video
                </div>
              </div>}
            {totalArticles > 0 &&
              <div className="sidebar-course-includes-item">
                <div className="sidebar-small-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 14 2 H 6 c -1.1 0 -1.99 0.9 -1.99 2 L 4 20 c 0 1.1 0.89 2 1.99 2 H 18 c 1.1 0 2 -0.9 2 -2 V 8 l -6 -6 Z M 6 20 V 4 h 7 v 5 h 5 v 11 H 6 Z"></path>
                  </svg>
                </div>
                <div className="sidebar-course-includes-text">
                  {totalArticles} articles
                </div>
              </div>}
            {downloadableResources > 0 &&
              <div className="sidebar-course-includes-item">
              <div className="sidebar-small-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 11.17 8 l -2 -2 H 4 v 12 h 16 V 8 h -8.83 Z M 4 4 h 6 l 2 2 h 8 c 1.1 0 2 0.9 2 2 v 10 c 0 1.1 -0.9 2 -2 2 H 4 c -1.1 0 -2 -0.9 -2 -2 l 0.01 -12 c 0 -1.1 0.89 -2 1.99 -2 Z m 6.55 9 v -3 h 2.9 v 3 H 16 l -4 4 l -4 -4 h 2.55 Z"></path>
                </svg>
              </div>
              <div className="sidebar-course-includes-text">
                {downloadableResources} downloadable resources
              </div>
            </div>}
            {totalExercises > 0 &&
              <div className="sidebar-course-includes-item">
              <div className="sidebar-small-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 8 3 a 2 2 0 0 0 -2 2 v 4 a 2 2 0 0 1 -2 2 H 3 v 2 h 1 a 2 2 0 0 1 2 2 v 4 a 2 2 0 0 0 2 2 h 2 v -2 H 8 v -5 a 2 2 0 0 0 -2 -2 a 2 2 0 0 0 2 -2 V 5 h 2 V 3 H 8 Z m 8 0 a 2 2 0 0 1 2 2 v 4 a 2 2 0 0 0 2 2 h 1 v 2 h -1 a 2 2 0 0 0 -2 2 v 4 a 2 2 0 0 1 -2 2 h -2 v -2 h 2 v -5 a 2 2 0 0 1 2 -2 a 2 2 0 0 1 -2 -2 V 5 h -2 V 3 h 2 Z"></path>
                </svg>
              </div>
              <div className="sidebar-course-includes-text">
              {totalExercises} coding exercises
              </div>
            </div>}
            <div className="sidebar-course-includes-item">
              <div className="sidebar-small-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 18.6 6.62 c -1.44 0 -2.8 0.56 -3.77 1.53 L 12 10.66 L 10.48 12 h 0.01 L 7.8 14.39 c -0.64 0.64 -1.49 0.99 -2.4 0.99 c -1.87 0 -3.39 -1.51 -3.39 -3.38 S 3.53 8.62 5.4 8.62 c 0.91 0 1.76 0.35 2.44 1.03 l 1.13 1 l 1.51 -1.34 L 9.22 8.2 A 5.37 5.37 0 0 0 5.4 6.62 C 2.42 6.62 0 9.04 0 12 s 2.42 5.38 5.4 5.38 c 1.44 0 2.8 -0.56 3.77 -1.53 l 2.83 -2.5 l 0.01 0.01 L 13.52 12 h -0.01 l 2.69 -2.39 c 0.64 -0.64 1.49 -0.99 2.4 -0.99 c 1.87 0 3.39 1.51 3.39 3.38 s -1.52 3.38 -3.39 3.38 c -0.9 0 -1.76 -0.35 -2.44 -1.03 l -1.14 -1.01 l -1.51 1.34 l 1.27 1.12 a 5.386 5.386 0 0 0 3.82 1.57 c 2.98 0 5.4 -2.41 5.4 -5.38 s -2.42 -5.37 -5.4 -5.37 Z"></path>
                </svg>
              </div>
              <div className="sidebar-course-includes-text">
              {fullLifetimeAccess}
              </div>
            </div>
            <div className="sidebar-course-includes-item">
              <div className="sidebar-small-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 17 1.01 L 7 1 c -1.1 0 -2 0.9 -2 2 v 18 c 0 1.1 0.9 2 2 2 h 10 c 1.1 0 2 -0.9 2 -2 V 3 c 0 -1.1 -0.9 -1.99 -2 -1.99 Z M 17 19 H 7 V 5 h 10 v 14 Z"></path>
                </svg>
              </div>
              <div className="sidebar-course-includes-text">
              {accessTypes}
              </div>
            </div>
            {assignments &&
              <div className="sidebar-course-includes-item">
              <div className="sidebar-small-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 19 3 h -4.18 C 14.4 1.84 13.3 1 12 1 s -2.4 0.84 -2.82 2 H 5 c -1.1 0 -2 0.9 -2 2 v 14 c 0 1.1 0.9 2 2 2 h 14 c 1.1 0 2 -0.9 2 -2 V 5 c 0 -1.1 -0.9 -2 -2 -2 Z m -7 0 c 0.55 0 1 0.45 1 1 s -0.45 1 -1 1 s -1 -0.45 -1 -1 s 0.45 -1 1 -1 Z m 2 14 H 7 v -2 h 7 v 2 Z m 3 -4 H 7 v -2 h 10 v 2 Z m 0 -4 H 7 V 7 h 10 v 2 Z"></path>
                </svg>
              </div>
              <div className="sidebar-course-includes-text">
              Assignments
              </div>
            </div>}
            {certificateOfCompletion &&
              <div className="sidebar-course-includes-item">
              <div className="sidebar-small-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20.39 19.37 L 16.38 18 L 15 22 l -3.08 -6 L 9 22 l -1.38 -4 l -4.01 1.37 l 2.92 -6 A 6.97 6.97 0 0 1 5 9 a 6.999 6.999 0 1 1 14 0 c 0 1.65 -0.57 3.17 -1.53 4.37 l 2.92 6 Z M 7 9 l 2.69 1.34 l -0.19 3 l 2.5 -1.66 l 2.5 1.65 l -0.17 -2.99 L 17 9 l -2.68 -1.35 l 0.18 -2.98 L 12 6.31 L 9.5 4.65 l 0.17 3.01 L 7 9 Z"></path>
                </svg>
              </div>
              <div className="sidebar-course-includes-text">
              Certificate of completion
              </div>
            </div>}
          </div>
          {applyCoupon}
        </div>
        <div className="sidebar-for-business">
          <div className="sidebar-main-content">
            <h3 className="sidebar-tight-letters">Training 5 or more people?</h3>
            <p>Get your team access to 5,500+ top Udemy courses anytime, anywhere.</p>
            <button>Try Udemy for Business</button>
          </div>
        </div>
      </div>
    </div>
  )
}
