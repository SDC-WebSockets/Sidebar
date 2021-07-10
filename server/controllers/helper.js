module.exports.price = (dbData) => {
  const courseId = dbData.courseId;
  const basePrice = dbData.base_price - 0.01;
  const discountPercentage = dbData.discount_percent;
  const discountedPrice = Math.floor(basePrice * (1 - discountPercentage / 100)) + 0.99;
  const today = new Date();
  const saleEndDate = Date(today.setDate(today.getDate() + dbData.sale_days));
  const saleOngoing = dbData.sale_ongoing;

  const appData = {
    courseId,
    basePrice,
    discountPercentage,
    discountedPrice,
    saleEndDate,
    saleOngoing,
  };
  return appData;
};

module.exports.video = (dbData) => {
  const s3Url = 'https://sdc-websockets-sidebar.s3-us-west-2.amazonaws.com/';
  const courseId = dbData.courseId;
  const previewVideoImgUrl = s3Url + dbData.videoimg_url;
  const previewVideoUrl = s3Url + dbData.video_url;

  const appData = {
    courseId,
    previewVideoImgUrl,
    previewVideoUrl,
  };

  return appData;
};

module.exports.sidebar = (dbData) => {
  const s3Url = 'https://sdc-websockets-sidebar.s3-us-west-2.amazonaws.com/';
  const courseId = dbData.courseId;
  const fullLifetimeAccess = dbData.full_access ? 'Full lifetime access' : 'Full access during subscription term';
  const accessTypes = 'Access on mobile and TV';
  const { assignments } = dbData;
  const certificateOfCompletion = dbData.completion_certificate;
  const downloadableResources = dbData.downloadable_resources;

  const appData = {
    courseId,
    fullLifetimeAccess,
    accessTypes,
    assignments,
    certificateOfCompletion,
    downloadableResources,
  };

  return appData;
};
