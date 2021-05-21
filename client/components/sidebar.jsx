import React, { useState, useEffect } from 'react';

export const Sidebar = () => {

  // Will match only numbers
  const regex = /\d+/;

  console.log(window.location.search);

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

  useEffect(() => {
    let mounted = true;

    fetch('http://localhost:3004/price?courseId=' + courseId)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setPriceData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch('http://localhost:3004/previewVideo?courseId=' + courseId)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setPreviewVideoData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch('http://localhost:3004/sidebar?courseId=' + courseId)
    .then(response => response.json())
    .then(data => {
      if (mounted) {
        setSidebarData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    fetch('http://localhost:9800/course/item/?courseId=' + courseId)
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

  let totalArticles;
  let totalLectures;
  let totalQuizzes;
  let totalExercises;
  let courseLength;

  if (courseData !== undefined) {
    ({totalArticles, totalLectures, totalQuizzes, totalExercises, courseLength} = courseData);
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
          {totalArticles > 0 ? <li>{totalArticles} articles</li> : <div></div>}
          {courseLength}
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
