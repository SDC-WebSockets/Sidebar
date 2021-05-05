import React, { useState, useEffect } from 'react';

export const Sidebar = () => {

  const [ courseID, setCourseID ] = useState(10);
  const [ priceData, setPriceData ] = useState();
  const [ previewVideoData, setPreviewVideoData ] = useState();
  const [ sidebarData, setSidebarData ] = useState();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let mounted = true;

    fetch('http://localhost:3004/price?courseID=' + courseID, { signal })
    .then(response => response.json())
    .then(data => {
      console.log("mounted: " + mounted);
      if (mounted) {
        setPriceData(data);
      }
    })
    .catch(error => console.warn("Error: " + error.message));

    return () => {
      mounted = false;
      controller.abort();
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
    basePrice = priceData.basePrice;
    discountPercentage = priceData.discountPercentage;
    discountedPrice = priceData.discountedPrice;
    saleEndDate = priceData.saleEndDate;
    saleOngoing = priceData.saleOngoing;
  }

  return (
    <div className="sidebar-container">
      <div className="preview-video">
      This will be a video.
      </div>
      <div className="price-info">
      { discountedPrice }{ basePrice }{ discountPercentage }
      </div>
      <div className="button-container">

      </div>
      <div className="course-includes">

      </div>
      <div className="coupon">

      </div>
      <div className="for-business">

      </div>
    </div>
  )
}
