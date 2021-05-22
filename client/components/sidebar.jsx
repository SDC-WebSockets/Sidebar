import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

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
    console.log("courseLength: " + courseLength);
    courseLength = DateTime.fromISO(courseLength).toSeconds();
    courseLength = Math.round((courseLength / 3600) * 2) / 2;
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
          {courseLength > 0 ? <li>{courseLength} hours on-demand video</li> : <div></div>}
          {totalArticles > 0 ? <li>{totalArticles} articles</li> : <div></div>}
          {totalLectures > 0 ? <li>{totalLectures} lectures</li> : <div></div>}
          {totalQuizzes > 0 ? <li>{totalQuizzes} quizzes</li> : <div></div>}
          {totalExercises > 0 ? <li>{totalExercises} exercises</li> : <div></div>}
          {downloadableResources > 0 ? <li>{downloadableResources} downloadable resources</li> : <div></div>}
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
