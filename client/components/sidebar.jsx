import React, { useState, useEffect } from 'react';

export const Sidebar = () => {

  // Will match only numbers
  const regex = /\d+/;

  // Gets course ID from the current page URL, assuming the only number in
  // that URL's pathname is the course ID (e.g.:
  // localhost:3000/course/99 or localhost:3000/course/99/ will return '99')
  const currentCourse = window.location.pathname.match(regex) === null ? 1 : window.location.pathname.match(regex)[0];

  const [ courseID, setCourseID ] = useState(currentCourse);
  const [ priceData, setPriceData ] = useState();
  const [ previewVideoData, setPreviewVideoData ] = useState();
  const [ sidebarData, setSidebarData ] = useState();

  useEffect(() => {
    let mounted = true;

    fetch('http://localhost:3004/price?courseID=' + courseID)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setPriceData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch('http://localhost:3004/previewVideo?courseID=' + courseID)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setPreviewVideoData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch('http://localhost:3004/sidebar?courseID=' + courseID)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setSidebarData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    return () => {
      mounted = false;
    }

  }, []);

  useEffect(() => {
    console.log(priceData !== undefined ? priceData.basePrice : "whoops");
  });

  let basePrice;
  let discountPercentage;
  let discountedPrice;
  let saleEndDate;
  let saleOngoing;

  if (priceData !== undefined) {
    ({basePrice, discountPercentage, discountedPrice, saleEndDate, saleOngoing} = priceData);
  }

  let previewVideoUrl;

  if (previewVideoData !== undefined) {
    previewVideoUrl = previewVideoData.previewVideoUrl;
  }

  let fullLifetimeAccess;
  let accessTypes;
  let assignments;
  let certificateOfCompletion;

  if (sidebarData !== undefined) {
    ({fullLifetimeAccess, accessTypes, assignments, certificateOfCompletion} = sidebarData);
  }

  let priceInfo = saleOngoing ? <div className="price-info">${discountedPrice} $<s>{basePrice}</s> {discountPercentage}% off!</div> : <div>{basePrice}</div>;

  return (
    <div className="sidebar-container">
      <div className="preview-video">
      This will be a video from {previewVideoUrl}
      </div>
      {priceInfo}
      <div className="button-container">
        <button className="add-to-cart">Add to cart</button>
        <button className="buy-now">Buy now</button>
        <p>30-Day Money-Back Guarantee</p>
      </div>
      <div className="course-includes">
        <b>This course includes:</b>
        <ul>
          <li>{fullLifetimeAccess}</li>
          <li>{accessTypes}</li>
          {assignments ? <li>Assignments</li> : <div></div>}
          {certificateOfCompletion ? <li>Certificate of Completion</li> : <div></div>}
        </ul>
      </div>
      <div className="coupon">
        Apply Coupon
      </div>
      <div className="for-business">
        <h2>Training 5 or more people?</h2>
        <p>Get your team access to 5,500+ top Udemy courses anytime, anywhere.</p>
        <button>Try Udemy for Business</button>
      </div>
    </div>
  )
}
