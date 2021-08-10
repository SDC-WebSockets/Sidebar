const { Sequelize, Model, DataTypes } = require('sequelize');
const pgconfig = require('./pg.config.js');

console.log(`DB connect at ${process.env.NODE_ENV === 'production' ? pgconfig.production : pgconfig.dev}`);
const sequelize = new Sequelize(`postgres://${process.env.NODE_ENV === 'production' ? pgconfig.production : pgconfig.dev}:5432/sdc_sidebar`, {
  benchmark: true,
  logging: (sqlQuery, timing) => {
    console.log(sqlQuery);
    console.log('Query Time: ', timing, ' ms');
  },
});
const queryInterface = sequelize.getQueryInterface();

class Sale extends Model { }
Sale.init({
  sale_id: {
    type: DataTypes.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  discountPercentage: DataTypes.INTEGER,
  saleEndDate: DataTypes.BIGINT,
  downloadableResources: DataTypes.INTEGER,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'sale',
  indexes: [
    {
      unique: true,
      fields: ['sale_id']
    }
  ],
});

class Price extends Model { }
Price.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  basePrice: DataTypes.INTEGER,
  sale_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Sale,
      key: 'sale_id'
    },
  },
  saleOngoing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'price',
  indexes: [
    {
      name: 'price_course_id',
      unique: true,
      fields: ['courseId']
    }
  ],
});

class PreviewVideo extends Model { }
PreviewVideo.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  videoUrl: DataTypes.STRING,
  videoImgUrl: DataTypes.STRING,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'video',
  indexes: [
    {
      name: 'video_course_id',
      unique: true,
      fields: ['courseId']
    }
  ],
});

class Sidebar extends Model { }
Sidebar.init({
  content_id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  contentType: DataTypes.STRING,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'sidebar',
  indexes: [
    {
      unique: true,
      fields: ['content_id']
    }
  ],
});

class SidebarSale extends Model { }
SidebarSale.init({
  id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  sale_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Sale,
      key: 'sale_id'
    },
  },
  content_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Sidebar,
      key: 'content_id'
    },
  },
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'sidebar_sale',
  indexes: [
    {
      name: 'sidebar_sale_sale_id',
      unique: false,
      fields: ['sale_id']
    }
  ],
});

Sale.hasMany(Price, { foreignKey: 'sale_id', targetKey: 'sale_id', onDelete: 'CASCADE' });
Price.belongsTo(Sale, { foreignKey: 'sale_id', targetKey: 'sale_id', onDelete: 'CASCADE' });
Sale.belongsToMany(Sidebar, {
  through: SidebarSale,
  foreignKey: 'sale_id',
  otherKey: 'content_id',
});
Sidebar.belongsToMany(Sale, {
  through: SidebarSale,
  as: 'sidebar',
  foreignKey: 'sale_id',
  otherKey: 'content_id',
});

const openConn = () => sequelize.authenticate()
  .then(() => {
    console.log(`DB connection successful.`);
    return Price.sync({ logging: false });
  })
  .catch((error) => {
    if (error.message === 'relation "price_course_id" already exists') {
      queryInterface.removeIndex('price', 'price_course_id');
      return Price.sync({ logging: false });
    }
    throw error;
  })
  .then(() => {
    console.log('The table for the Price model was synced!');
    return PreviewVideo.sync({ logging: false });
  })
  .catch((error) => {
    if (error.message === 'relation "video_course_id" already exists') {
      queryInterface.removeIndex('video', 'video_course_id');
      return PreviewVideo.sync({ logging: false });
    }
    throw error;
  })
  .then(() => {
    console.log('The table for the Preview Video model was synced!');
    return Sidebar.sync({ logging: false });
  })
  .then(() => {
    console.log('The table for the Sidebar model was synced!');
    return Sale.sync({ logging: false });
  })
  .then(() => {
    console.log('The table for the Sale model was synced!');
    return SidebarSale.sync({ logging: false });
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

const closeConn = () => sequelize.close()
  .then(() => {
    console.log('DB connection closed.');
  });

module.exports.Price = Price;
module.exports.PreviewVideo = PreviewVideo;
module.exports.Sidebar = Sidebar;
module.exports.Sale = Sale;
module.exports.SidebarSale = SidebarSale;
module.exports.openConn = openConn;
module.exports.closeConn = closeConn;
