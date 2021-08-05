const { Price, PreviewVideo, Sidebar, Sale, SidebarSale } = require('../../database/pgDatabase');


module.exports.priceDBtoAPI = (dbData) => {
  const { courseId, discountPercentage, saleOngoing } = dbData;
  const basePrice = dbData.basePrice - 0.01;
  const discountedPrice = Math.floor(basePrice * (1 - discountPercentage / 100)) + 0.99;
  let saleEndDate = new Date(Number(dbData.saleEndDate));
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
  const dbSale = {};
  const inputPriceTypes = {
    basePrice: 'number',
    discountPercentage: 'number',
    saleEndDate: 'number',
    saleOngoing: 'boolean',
  };
  const dbKeys = ['basePrice', 'discountPercentage', 'saleEndDate', 'saleOngoing'];
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
    fullLifetimeAccess: 'boolean',
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

module.exports.transformToDBformat = async (newDoc) => {
  const { courseId } = newDoc;
  // create a new objects
  const newPrice = newDoc.price;
  const newPreviewVideo = newDoc.previewVideo;
  const newSidebar = newDoc.sidebar;
  // console.log(courseId, newPrice, newSidebar, newPreviewVideo);

  const dbSale = {};
  const dbPrice = {};
  const dbJunction = [];

  // *** look up to see if type of sale exists.
  const sale_id = await Sale.findAll({
    where: {
      discountPercentage: newPrice.discountPercentage,
      saleEndDate: Date.parse(newPrice.saleEndDate),
      downloadableResources: newSidebar.downloadableResources,
    },
    attributes: ['sale_id'],
  });
  console.log(sale_id)
  if (sale_id.length === 0) {
    const currNumSaleTypes = await Sale.count();
    const newSaleId = currNumSaleTypes + 1;
    sale_id.unshift(newSaleId);
  } else {
    const exisitngSaleId = sale_id[0].dataValues.sale_id;
    sale_id.unshift(exisitngSaleId);
  }
  dbSale.sale_id = sale_id[0];
  dbPrice.sale_id = sale_id[0];

  const inputSaleTypes = {
    discountPercentage: 'number',
    saleEndDate: 'string',
    downloadableResources: 'number',
  }
  const saleKeys = Object.keys(inputSaleTypes);
  for (let i = 0; i < saleKeys.length; i += 1) {
    const currKey = saleKeys[i];
    const inputTypeOf = inputSaleTypes[currKey];
    if (currKey === 'saleEndDate') {
      if (typeof newPrice[currKey] === inputTypeOf) {
        const saleEndDate = Date.parse(newPrice[currKey]);
        dbSale.saleEndDate = saleEndDate;
      } else {
        return { error: `Sale ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
      }
    } else if (currKey === 'discountPercentage') {
      if (typeof newPrice[currKey] === inputTypeOf) {
        dbSale[currKey] = newPrice[currKey];
      } else {
        return { error: `Sale ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
      }
    } else if (currKey === 'downloadableResources') {
      if (typeof newSidebar[currKey] === inputTypeOf) {
        dbSale[currKey] = newSidebar[currKey];
      } else {
        return { error: `Sale ${currKey} type is ${inputTypeOf} and does not match ${keyType}.` };
      }
    } else {
      return { error: `Sale ${currKey} does not exist.` };
    }
  }
  // console.log(dbSale);

  const inputPriceTypes = {
    basePrice: 'number',
    saleOngoing: 'boolean',
  };
  const dbPriceKeys = ['basePrice', 'saleOngoing'];
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
    if (dbPriceKeys.includes(currKey)) {
      if (inputTypeOf === 'number') {
        const value = Math.round(newPrice[currKey]);
        dbPrice[currKey] = value;
      } else {
        dbPrice[currKey] = newPrice[currKey];
      }
    }
  }
  dbPrice.courseId = courseId;
  // console.log(dbPrice);

  // *** look for next id# in junction table
  const lastJunctionId = await SidebarSale.count();
  let id = lastJunctionId + 1;
  const dbContentTypes = {
    fullLifetimeAccess: 1,
    assignments: 2,
    certificateOfCompletion: 3,
  }
  const sidebarKeys = Object.keys(dbContentTypes);
  for (let i = 0; i < sidebarKeys.length; i += 1) {
    const currKey = sidebarKeys[i];
    if (newSidebar[currKey] === undefined) {
      return { error: `Sidebar ${currKey} does not exist.` };
    }
    if (newSidebar[currKey]) {
      const newJunc = {
        id,
        sale_id: sale_id[0],
        content_id: dbContentTypes[currKey],
      }
      dbJunction.push(newJunc);
      id++;
    }
  }
  console.log(dbJunction);

  const dbVideo = transformVideo(newPreviewVideo);
  if (dbVideo.courseId === undefined) {
    dbVideo.courseId = courseId;
  }
  // console.log(dbVideo)

  return {
    courseId,
    price: dbPrice,
    sale: dbSale,
    previewVideo: dbVideo,
    junction: dbJunction,
  };
};

module.exports.updatePriceAPItoDB = async (newPrice, courseId) => {
  const dbPrice = {};
  const dbSale = {};
  const inputPriceTypes = {
    basePrice: 'number',
    discountPercentage: 'number',
    saleEndDate: 'string',
    saleOngoing: 'boolean',
    sale_id: 'number',
  };
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

    if (currKey === 'basePrice') {
      const value = Math.round(newPrice[currKey]);
      dbPrice[currKey] = value;
    } else if (currKey === 'discountPercentage') {
      dbSale[currKey] = newPrice[currKey];
    } else if (currKey === 'saleEndDate') {
      const saleEndDate = Date.parse(newPrice[currKey]);
      dbSale.saleEndDate = saleEndDate;
    } else if (currKey === 'saleOngoing') {
      dbPrice[currKey] = newPrice[currKey];
    }
  }

  if (Object.keys(dbSale).length === 0) {
    return { price: dbPrice, };
  }
  // *** look up to see if type of sale exists.
  const currPrice = await Price.findOne({ where: courseId, attributes: ['sale_id'] });
  const currSaleId = currPrice.dataValues.sale_id;
  const currSale = await Sale.findOne({ where: {sale_id: currSaleId}});
  console.log(courseId, currSaleId, currSale);
  const sale_id = await Sale.findAll({
    where: {
      discountPercentage: dbSale.discountPercentage ? dbSale.discountPercentage : currSale.dataValues.discountPercentage,
      saleEndDate: dbSale.saleEndDate ? dbSale.saleEndDate : currSale.dataValues.saleEndDate,
      downloadableResources: dbSale.downloadableResources ? dbSale.downloadableResources : currSale.dataValues.downloadableResources,
    },
    attributes: ['sale_id'],
  });
  console.log(sale_id)
  if (sale_id.length === 0) {
    const currNumSaleTypes = await Sale.count();
    const newSaleId = currNumSaleTypes + 1;
    sale_id.unshift(newSaleId);
  } else {
    const exisitngSaleId = sale_id[0].dataValues.sale_id;
    sale_id.unshift(exisitngSaleId);
  }
  dbSale.sale_id = sale_id[0];
  dbPrice.sale_id = sale_id[0];

  return {
    price: dbPrice,
    sale: dbSale,
  }
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

module.exports.updateSidebarAPItoDB = async (newSidebar, courseId) => {
  const dbSidebar = [];
  const dbSale = {};
  const currPrice = await Price.findOne({ where: courseId, attributes: ['sale_id'] });
  let sale_id = currPrice.dataValues.sale_id;
  const exisitngSaleId = sale_id;
  console.log(courseId, sale_id);
  const currSaleJunctions = await SidebarSale.findAll({ where: { sale_id } });
  const existingSaleJunctions = [];
  for (let j = 0; j < currSaleJunctions.length; j++) {
    const currJunction = currSaleJunctions[j].dataValues;
    existingSaleJunctions.push(currJunction.content_id);
  }
  console.log(existingSaleJunctions)

  const coursesUsingSale = await Price.findAll({ where: sale_id });
  console.log(coursesUsingSale.length);
  if (coursesUsingSale.length > 1) {
    const currNumSaleTypes = await Sale.count();
    sale_id = currNumSaleTypes + 1;
  }
  if (newSidebar.downloadableResources) {
    dbSale.downloadableResources = downloadableResources;
    dbSale.sale_id = sale_id;
  }

  const dbContentTypes = {
    fullLifetimeAccess: 1,
    assignments: 2,
    certificateOfCompletion: 3,
  }
  const maxId = await SidebarSale.max('id');
  console.log(maxId)
  let id = maxId + 1;
  const sidebarKeys = Object.keys(newSidebar);
  for (let i = 0; i < sidebarKeys.length; i += 1) {
    const currKey = sidebarKeys[i];
    const contentType = dbContentTypes[currKey];
    if (existingSaleJunctions.includes(contentType) && !newSidebar[currKey]) {
      await SidebarSale.destroy({
        where: {
          sale_id: exisitngSaleId,
          content_id: contentType,
        }});
    } else if (!existingSaleJunctions.includes(contentType) && newSidebar[currKey]) {
      const newJunction = {
        id,
        sale_id,
        content_id: contentType
      }
      id++;
      dbSidebar.push(newJunction);
    }
  }

  if (Object.keys(dbSale).length === 0) {
    return { sidebar: dbSidebar, };
  }
  return {
    sidebar: dbSidebar,
    sale: dbSale,
  }

};
