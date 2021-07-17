/* eslint-disable no-console */
module.exports.priceDBtoAPI = (dbData) => {
  const { courseId, discountPercentage, saleOngoing } = dbData;
  const basePrice = dbData.basePrice - 0.01;
  const discountedPrice = Math.floor(basePrice * (1 - discountPercentage / 100)) + 0.99;
  let saleEndDate = new Date(dbData.saleEndDate);
  saleEndDate = saleEndDate.toUTCString();

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

module.exports.videoDBtoAPI = (dbData) => {
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

module.exports.sidebarDBtoAPI = (dbData) => {
  const {
    courseId, assignments, certificateOfCompletion, downloadableResources,
  } = dbData;
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

const transformPrice = (newPrice) => {
  const dbPrice = {};
  const inputPriceTypes = {
    basePrice: 'number',
    discountPercentage: 'number',
    saleEndDate: 'string',
    saleOngoing: 'boolean',
  };
  const dbKeys = ['basePrice', 'discountPercentage', 'saleNumOfDays', 'saleOngoing'];
  const priceKeys = Object.keys(inputPriceTypes);
  for (let i = 0; i < priceKeys.length; i += 1) {
    const currKey = priceKeys[i];
    if (newPrice[currKey] === undefined) {
      return { error: `Price ${currKey} does not exist.` };
    }
    const inputTypeOf = inputPriceTypes[currKey];
    const keyType = typeof newPrice[currKey];
    if (keyType !== inputTypeOf) {
      return { error: `Price ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
    }
    if (dbKeys.includes(currKey)) {
      if (inputTypeOf === 'number') {
        const value = Math.round(newPrice[currKey]);
        dbPrice[currKey] = value;
      } else {
        dbPrice[currKey] = newPrice[currKey];
      }
    } else if (currKey === 'saleEndDate') {
      const now = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;
      const saleEndDate = new Date(newPrice[currKey]);
      const saleNumOfDays = (saleEndDate - now) / msPerDay;
      dbPrice.saleNumOfDays = Math.round(saleNumOfDays);
    }
  }
  return dbPrice;
};

const transformVideo = (newVideo) => {
  const dbVideo = {};
  const inputVideoTypes = {
    previewVideoImgUrl: 'string',
    previewVideoUrl: 'string',
  };
  const videoKeys = Object.keys(inputVideoTypes);
  for (let i = 0; i < videoKeys.length; i += 1) {
    const currKey = videoKeys[i];
    if (newVideo[currKey] === undefined) {
      return { error: `Video ${currKey} does not exist.` };
    }
    const inputTypeOf = inputVideoTypes[currKey];
    const keyType = typeof newVideo[currKey];
    if (keyType !== inputTypeOf) {
      return { error: `Video ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
    }
    if (currKey === 'previewVideoImgUrl') {
      dbVideo.videoImgUrl = newVideo[currKey];
    } else if (currKey === 'previewVideoUrl') {
      dbVideo.videoUrl = newVideo[currKey];
    }
  }
  return dbVideo;
};

const transformSidebar = (newSidebar) => {
  const dbSidebar = {};
  const inputSidebarTypes = {
    fullLifetimeAccess: 'string',
    assignments: 'boolean',
    certificateOfCompletion: 'boolean',
    downloadableResources: 'number',
  };
  const dbKeys = ['fullLifetimeAccess', 'assignments', 'certificateOfCompletion', 'downloadableResources'];
  const sidebarKeys = Object.keys(inputSidebarTypes);
  for (let i = 0; i < sidebarKeys.length; i += 1) {
    const currKey = sidebarKeys[i];
    if (newSidebar[currKey] === undefined) {
      return { error: `Sidebar ${currKey} does not exist.` };
    }
    const inputTypeOf = inputSidebarTypes[currKey];
    const keyType = typeof newSidebar[currKey];
    if (keyType !== inputTypeOf) {
      return { error: `Sidebar ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
    }
    if (dbKeys.includes(currKey)) {
      dbSidebar[currKey] = newSidebar[currKey];
      if (currKey === 'fullLifetimeAccess') {
        dbSidebar[currKey] = newSidebar[currKey] === 'Full lifetime access';
      }
    }
  }
  return dbSidebar;
};

module.exports.transformToDBformat = (newDoc) => {
  const { courseId } = newDoc;
  // create a new objects
  const newPrice = newDoc.price;
  const newPreviewVideo = newDoc.previewVideo;
  const newSidebar = newDoc.sidebar;
  // console.log(courseId, newPrice, newSidebar, newPreviewVideo);
  const dbPrice = transformPrice(newPrice);
  if (dbPrice.courseId === undefined) {
    dbPrice.courseId = courseId;
  }
  const dbVideo = transformVideo(newPreviewVideo);
  if (dbVideo.courseId === undefined) {
    dbVideo.courseId = courseId;
  }
  const dbSidebar = transformSidebar(newSidebar);
  if (dbSidebar.courseId === undefined) {
    dbSidebar.courseId = courseId;
  }

  return {
    courseId,
    price: dbPrice,
    previewVideo: dbVideo,
    sidebar: dbSidebar,
  };
};

module.exports.updatePriceAPItoDB = (newPrice) => {
  const dbPrice = {};
  const inputPriceTypes = {
    basePrice: 'number',
    discountPercentage: 'number',
    saleEndDate: 'string',
    saleOngoing: 'boolean',
  };
  const dbKeys = ['basePrice', 'discountPercentage', 'saleNumOfDays', 'saleOngoing'];
  const priceKeys = Object.keys(newPrice);
  for (let i = 0; i < priceKeys.length; i += 1) {
    const currKey = priceKeys[i];
    if (newPrice[currKey] === undefined) {
      return { error: `Price ${currKey} does not exist.` };
    }
    const inputTypeOf = inputPriceTypes[currKey];
    const keyType = typeof newPrice[currKey];
    if (keyType !== inputTypeOf) {
      return { error: `Price ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
    }
    if (dbKeys.includes(currKey)) {
      if (inputTypeOf === 'number') {
        const value = Math.round(newPrice[currKey]);
        dbPrice[currKey] = value;
      } else {
        dbPrice[currKey] = newPrice[currKey];
      }
    } else if (currKey === 'saleEndDate') {
      const now = new Date();
      const msPerDay = 24 * 60 * 60 * 1000;
      const saleEndDate = new Date(newPrice[currKey]);
      const saleNumOfDays = (saleEndDate - now) / msPerDay;
      dbPrice.saleNumOfDays = Math.round(saleNumOfDays);
    }
  }
  return dbPrice;
};

module.exports.updateVideoAPItoDB = (newVideo) => {
  const dbVideo = {};
  const inputVideoTypes = {
    previewVideoImgUrl: 'string',
    previewVideoUrl: 'string',
  };
  const videoKeys = Object.keys(newVideo);
  for (let i = 0; i < videoKeys.length; i += 1) {
    const currKey = videoKeys[i];
    if (newVideo[currKey] === undefined) {
      return { error: `Video ${currKey} does not exist.` };
    }
    const inputTypeOf = inputVideoTypes[currKey];
    const keyType = typeof newVideo[currKey];
    if (keyType !== inputTypeOf) {
      return { error: `Video ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
    }
    if (currKey === 'previewVideoImgUrl') {
      dbVideo.videoImgUrl = newVideo[currKey];
    } else if (currKey === 'previewVideoUrl') {
      dbVideo.videoUrl = newVideo[currKey];
    }
  }
  return dbVideo;
};

module.exports.updateSidebarAPItoDB = (newSidebar) => {
  const dbSidebar = {};
  const inputSidebarTypes = {
    fullLifetimeAccess: 'string',
    assignments: 'boolean',
    certificateOfCompletion: 'boolean',
    downloadableResources: 'number',
  };
  const dbKeys = ['fullLifetimeAccess', 'assignments', 'certificateOfCompletion', 'downloadableResources'];
  const sidebarKeys = Object.keys(newSidebar);
  for (let i = 0; i < sidebarKeys.length; i += 1) {
    const currKey = sidebarKeys[i];
    if (newSidebar[currKey] === undefined) {
      return { error: `Sidebar ${currKey} does not exist.` };
    }
    const inputTypeOf = inputSidebarTypes[currKey];
    const keyType = typeof newSidebar[currKey];
    if (keyType !== inputTypeOf) {
      return { error: `Sidebar ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
    }
    if (dbKeys.includes(currKey)) {
      dbSidebar[currKey] = newSidebar[currKey];
      if (currKey === 'fullLifetimeAccess') {
        dbSidebar[currKey] = newSidebar[currKey] === 'Full lifetime access';
      }
    }
  }
  return dbSidebar;
};
