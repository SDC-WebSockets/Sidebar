const weightedTrueGenerator = (percentageChance) => Math.random() * 100 < percentageChance;

const createPricing = (courseId) => {
  const minPrice = 50;
  //  the calculation: (range * multiplesOf) + minPrice would give you the maxPrice = 150
  const range = 20;
  const multiplesOf = 5;
  const basePrice = Math.floor(Math.random() * range) * multiplesOf + minPrice;

  const maxDiscount = 85;
  const minDiscount = 5;
  const discountPercentage = Math.floor(Math.random() * (maxDiscount - minDiscount)) + minDiscount;

  const maxSaleDays = 30;
  const saleNumOfDays = Math.floor(Math.random() * maxSaleDays);
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const saleEndDate = Date(now + saleNumOfDays * msPerDay);

  const saleOngoing = weightedTrueGenerator(30);

  const priceData = { courseId, basePrice, discountPercentage, saleEndDate, saleOngoing };

  return priceData;
};

const createVideoData = (courseId) => {
  const fragment = Math.floor(Math.random() * 888888);

  const videoData = {
    courseId,
    previewVideoImgUrl: `videoImg/${courseId % 1000}.jpg#${fragment}`,
    previewVideoUrl: `video/${courseId % 1000}.mp4#${fragment}`,
  };

  return videoData;
};

const createSidebarData = (courseId) => {
  const fullLifetimeAccess = !!weightedTrueGenerator(70);
  // const accessTypes = 'Access on mobile and TV';
  const assignments = weightedTrueGenerator(70);
  const certificateOfCompletion = weightedTrueGenerator(90);
  const downloadableResources = weightedTrueGenerator(90) ? Math.round(Math.random() * 25) : 0;
  const sidebarData = { courseId, fullLifetimeAccess, assignments, certificateOfCompletion, downloadableResources };

  return sidebarData;
};


const dataGen = () => {
  const courseId = 10 ** 7 + Math.floor(Math.random() * 888888)
  const price = createPricing(courseId);
  const previewVideo = createVideoData(courseId);
  const sidebar = createSidebarData(courseId);

  return { courseId, price, previewVideo, sidebar };
};

module.exports.postDataGen = dataGen;
// console.log(dataGen())
