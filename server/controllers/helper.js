module.exports.price = (dbData) => {
  const { courseId, discountPercentage, saleOngoing } = dbData;
  const basePrice = dbData.basePrice - 0.01;
  const discountedPrice = Math.floor(basePrice * (1 - discountPercentage / 100)) + 0.99;
  const today = new Date();
  const saleEndDate = Date(today.setDate(today.getDate() + dbData.saleNumOfDays));

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
  const { courseId } = dbData;
  const previewVideoImgUrl = s3Url + dbData.videoImgUrl;
  const previewVideoUrl = s3Url + dbData.videoUrl;

  const appData = {
    courseId,
    previewVideoImgUrl,
    previewVideoUrl,
  };

  return appData;
};

module.exports.sidebar = (dbData) => {
  const { courseId, assignments, certificateOfCompletion, downloadableResources } = dbData;
  const fullLifetimeAccess = dbData.fullLifetimeAccess ? 'Full lifetime access' : 'Full access during subscription term';
  const accessTypes = 'Access on mobile and TV';

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
