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
    courseLength = DateTime.fromISO(courseLength).toSeconds();
    courseLength = Math.round((courseLength / 3600) * 2) / 2;
  }

  let priceInfo = saleOngoing ?
    <div className="sidebar-price-info">
      <div className="sidebar-big-price">
        ${discountedPrice}
      </div>
      <div className="sidebar-discount-info">
        $<s>{basePrice}</s> {discountPercentage}% off!
      </div>
    </div> :
    <div className="sidebar-big-price">${basePrice}</div>;

  return (
    <div className="sidebar-container">
      <div className="sidebar-container-content">
        <button className="sidebar-preview-video">
          <img src={previewVideoUrl} alt="Preview video image for this class." ></img>
          <span className="sidebar-preview-video-overlay-gradient"></span>
          <svg xmlns="http://www.w3.org/2000/svg">
            <g>
              <title>Layer 1</title>
              <ellipse ry="10" rx="10" id="svg_1" cy="219.5" cx="317" stroke="#000" fill="#fff"/>
              <ellipse stroke="#000" strokeWidth="0" ry="32" rx="31.50001" id="svg_2" cy="96" cx="170.37736" fill="#ffffff"/>
              <path transform="rotate(90 172.951 96)" stroke="#000" id="svg_9" d="m161.10466,107.73892l11.84616,-23.47785l11.84616,23.47785l-23.69232,0z" fill="#000000"/>
            </g>
          </svg>
          <span className="sidebar-preview-video-overlay-text">Preview this course</span>
        </button>
        <div className="sidebar-main-content">
          {priceInfo}
          <div className="sidebar-button-container">
            <button className="sidebar-add-to-cart-button">Add to cart</button>
            <button className="sidebar-buy-now-button">Buy now</button>
            <p>30-Day Money-Back Guarantee</p>
          </div>
          <div className="sidebar-course-includes">
            <b>This course includes:</b>
            {courseLength > 0 && <div>{courseLength} hours on-demand video</div>}
            {totalArticles > 0 && <div>{totalArticles} articles</div>}
            {totalLectures > 0 && <div>{totalLectures} lectures</div>}
            {totalQuizzes > 0 && <div>{totalQuizzes} quizzes</div>}
            {totalExercises > 0 && <div>{totalExercises} exercises</div>}
            {downloadableResources > 0 && <div>{downloadableResources} downloadable resources</div>}
            <div>{fullLifetimeAccess}</div>
            <div>{accessTypes}</div>
            {assignments && <div>Assignments</div>}
            {certificateOfCompletion && <div>Certificate of Completion</div>}
          </div>
          <div className="sidebar-coupon">
            Apply Coupon
          </div>
          <div className="sidebar-for-business">
            <h2>Training 5 or more people?</h2>
            <p>Get your team access to 5,500+ top Udemy courses anytime, anywhere.</p>
            <button>Try Udemy for Business</button>
          </div>
        </div>
      </div>
    </div>
  )
}
