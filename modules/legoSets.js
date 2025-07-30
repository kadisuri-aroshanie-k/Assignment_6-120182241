require('dotenv').config();         
require('pg');                      
const Sequelize = require('sequelize'); // Import Sequelize
const Op = Sequelize.Op;            // Sequelize operator

class LegoData {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.PGDATABASE,
      process.env.PGUSER,
      process.env.PGPASSWORD,
      {
        host: process.env.PGHOST,
        port: process.env.PGPORT || 5432,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      }
    );

    this.Theme = this.sequelize.define('Theme', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: Sequelize.STRING
    }, {
      createdAt: false,
      updatedAt: false
    });

    this.Set = this.sequelize.define('Set', {
      set_num: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING
    }, {
      createdAt: false,
      updatedAt: false
    });

    this.Set.belongsTo(this.Theme, { foreignKey: 'theme_id' });
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.sequelize
        .sync()
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  getAllSets() {
    return new Promise((resolve, reject) => {
      this.Set.findAll({
        include: [this.Theme]
      })
        .then((sets) => resolve(sets))
        .catch((err) => reject("Error retrieving sets: " + err));
    });
  }

  getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
      this.Set.findAll({
        where: { set_num: setNum },
        include: [this.Theme]
      })
        .then((sets) => {
          if (sets.length > 0) {
            resolve(sets[0]);
          } else {
            reject("Unable to find requested set");
          }
        })
        .catch((err) => reject("Error retrieving set: " + err));
    });
  }

  getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
      this.Set.findAll({
        include: [this.Theme],
        where: {
          '$Theme.name$': {
            [Op.iLike]: `%${theme}%`
          }
        }
      })
        .then((sets) => {
          if (sets.length > 0) {
            resolve(sets);
          } else {
            reject("Unable to find requested sets");
          }
        })
        .catch((err) => reject("Error retrieving sets by theme: " + err));
    });
  }

  addSet(newSet) {
    return new Promise((resolve, reject) => {
      this.Set.create(newSet)
        .then(() => resolve())
        .catch((err) => reject(err.errors[0].message));
    });
  }

  getAllThemes() {
    return new Promise((resolve, reject) => {
      this.Theme.findAll()
        .then((themes) => resolve(themes))
        .catch((err) => reject("Error retrieving themes: " + err));
    });
  }

  deleteSetByNum(setNum) {
    return new Promise((resolve, reject) => {
      this.Set.destroy({
        where: { set_num: setNum }
      })
        .then((rowsDeleted) => {
          if (rowsDeleted > 0) {
            resolve();
          } else {
            reject("Set not found");
          }
        })
        .catch((err) => {
          reject(err.errors ? err.errors[0].message : "Failed to delete set");
        });
    });
  }

  // Add updateSet() method
  updateSet(setNum, newData) {
    return new Promise((resolve, reject) => {
      this.Set.update(
        {
          name: newData.name,
          year: newData.year,
          num_parts: newData.num_parts,
          img_url: newData.img_url,
          theme_id: newData.theme_id
        },
        { where: { set_num: setNum } }
      )
        .then(([rowsUpdated]) => {
          if (rowsUpdated === 0) {
            reject("No set was updated");
          } else {
            resolve();
          }
        })
        .catch(err =>
          reject(err.errors ? err.errors[0].message : "Update failed")
        );
    });
  }
}

module.exports = LegoData;
