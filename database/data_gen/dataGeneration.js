const fs = require('fs');
const path = require('path');

const pricePath = path.join(`${__dirname}/priceData.csv`);
const salePath = path.join(`${__dirname}/saleData.csv`);
const videoPath = path.join(`${__dirname}/videoData.csv`);
const sidebarPath = path.join(`${__dirname}/sidebar.csv`);
const junctionPath = path.join(`${__dirname}/junctionTable.csv`);

const weightedTrueGenerator = (percentageChance) => Math.random() * 100 < percentageChance;

const course1 = {
  price: {
    courseId: 1,
    basePrice: 90,
    sale_id: 1,
    saleOngoing: false,
  },
  sale: {
    sale_id: 1,
    discountPercentage: 25,
    saleEndDate: 950400505,
    downloadableResources: 23,
  },
  sidebar: {
    courseId: 1,
    fullLifetimeAccess: true,
    assignments: false,
    certificateOfCompletion: true,
    downloadableResources: 23,
  },
  video: {
    courseId: 1,
    videoImgUrl: 'videoImg/1.jpg#116378',
    videoUrl: 'video/1.mp4#116378',
  },
};
const createPricing = (courseId, maxSaleTypes) => {
  const minPrice = 50;
  //  the calculation: (range * multiplesOf) + minPrice would give you the maxPrice = 150
  const range = 20;
  const multiplesOf = 5;
  const basePrice = Math.floor(Math.random() * range) * multiplesOf + minPrice;

  const saleOngoing = weightedTrueGenerator(30);

  const sale_id = Math.ceil(Math.random() * maxSaleTypes);

  const priceData = [courseId, basePrice, sale_id, saleOngoing];

  return priceData;
};

const createSale = (sale_id) => {
  const maxDiscount = 85;
  const minDiscount = 5;
  const discountPercentage = Math.floor(Math.random() * (maxDiscount - minDiscount)) + minDiscount;

  const maxSaleDays = 30;
  const saleNumOfDays = Math.floor(Math.random() * maxSaleDays);
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const saleEndDate = now + saleNumOfDays * msPerDay;

  const downloadableResources = Math.ceil(Math.random() * 105);

  return [sale_id, discountPercentage, saleEndDate, downloadableResources];
}

const createVideoData = (courseId) => {
  const fragment = Math.floor(Math.random() * 888888);

  const videoData = [courseId, `videoImg/${courseId % 1000}.jpg#${fragment}`, `video/${courseId % 1000}.mp4#${fragment}`];

  return videoData;
};

const createSidebarCSV = () => {
  const sidebarStream = fs.createWriteStream(sidebarPath);
  const sidebarKeys = 'contentId,contentType';
  sidebarStream.write(`${sidebarKeys}\n`);
  sidebarStream.write(`1,fullLifetimeAccess\n`);
  sidebarStream.write(`2,assignments\n`);
  sidebarStream.write(`3,certificateOfCompletion\n`);
  sidebarStream.write(`4,downloadableResources\n`);

  sidebarStream.end();
  console.log('Completed Sidebar Writing.');
}

const generatePriceData = async (numberOfCourses, maxSaleTypes) => {
  console.log(`Generating ${numberOfCourses} Price records`);
  const priceStream = fs.createWriteStream(pricePath);
  const priceKeys = 'courseId,basePrice,sale_id,saleOngoing';
  priceStream.write(`${priceKeys}\n`);
  const {
    courseId, basePrice, sale_id, saleOngoing,
  } = course1.price;
  priceStream.write(`${courseId},${basePrice},${sale_id},${saleOngoing}\n`);

  for (let i = 2; i <= numberOfCourses; i += 1) {
    const newPrice = createPricing(i, maxSaleTypes);
    priceStream.write(`${newPrice}\n`);
  }
  priceStream.end();
  console.log('Completed Price Writing.');
};

const generateSaleData = async (maxSaleTypes) => {
  console.log(`Generating ${maxSaleTypes} Sale records`);
  const priceStream = fs.createWriteStream(salePath);
  const priceKeys = 'sale_id,discountPercentage,saleEndDate,downloadableResources';
  priceStream.write(`${priceKeys}\n`);
  const {
    sale_id, discountPercentage, saleEndDate, downloadableResources
  } = course1.sale;
  priceStream.write(`${sale_id},${discountPercentage},${saleEndDate},${downloadableResources}\n`);

  for (let i = 2; i <= maxSaleTypes; i += 1) {
    const newPrice = createSale(i);
    priceStream.write(`${newPrice}\n`);
  }
  priceStream.end();
  console.log('Completed Sale Writing.');
};

const generateVideoData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} video records`);
  const videoStream = fs.createWriteStream(videoPath);
  const videoKeys = 'courseId,videoImgUrl,videoUrl';
  videoStream.write(`${videoKeys}\n`);
  const { courseId, videoImgUrl, videoUrl } = course1.video;
  videoStream.write(`${courseId},${videoImgUrl},${videoUrl}\n`);

  for (let i = 2; i <= numberOfCourses; i += 1) {
    const newVideo = createVideoData(i);
    videoStream.write(`${newVideo}\n`);
  }
  videoStream.end();
  console.log('Completed Video Writing.');
};

const generateJunctionTable = async (numberOfCourses, maxSaleTypes) => {
  console.log(`Generating Junction Table`);
  const junctionStream = fs.createWriteStream(junctionPath);
  const junctionKeys = 'id,content_id,sale_id';
  let id = 1;
  junctionStream.write(`${junctionKeys}\n`);
  let {
    courseId, fullLifetimeAccess, assignments, certificateOfCompletion, downloadableResources,
  } = course1.sidebar;
  if (fullLifetimeAccess) {
    junctionStream.write(`${id},1,1\n`);
    id++;
  }
  if (assignments) {
    junctionStream.write(`${id},2,1\n`);
    id++;
  }
  if (certificateOfCompletion) {
    junctionStream.write(`${id},3,1\n`);
    id++;
  }
  if (downloadableResources) {
    junctionStream.write(`${id},4,1\n`);
    id++;
  }

  for (let i = 2; i <= maxSaleTypes; i += 1) {
    fullLifetimeAccess = !!weightedTrueGenerator(70);
    assignments = weightedTrueGenerator(70);
    certificateOfCompletion = weightedTrueGenerator(90);
    downloadableResources = weightedTrueGenerator(90);

    if (fullLifetimeAccess) {
      junctionStream.write(`${id},1,${i}\n`);
      id++;
    }
    if (assignments) {
      junctionStream.write(`${id},2,${i}\n`);
      id++;
    }
    if (certificateOfCompletion) {
      junctionStream.write(`${id},3,${i}\n`);
      id++;
    }
    if (downloadableResources) {
      junctionStream.write(`${id},4,${i}\n`);
      id++;
    }
  }
  junctionStream.end();
  console.log('Completed Junction Writing.');
};

const dataGen = async (numberOfCourses, maxSaleTypes) => {
  console.log(`Generating ${numberOfCourses} course records and ${maxSaleTypes} sale types`);
  createSidebarCSV();
  generateSaleData(maxSaleTypes);
  generatePriceData(numberOfCourses, maxSaleTypes);
  generateVideoData(numberOfCourses);
  generateJunctionTable(numberOfCourses, maxSaleTypes);
};

dataGen(10 ** 7, 10 ** 6 * 1.5);
