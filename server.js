/********************************************************************************
*  WEB700 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Kuruwita Arachchige Dona Isuri Aroshanie Kuruwita Student ID: 120182241 Date: 30-07-2025
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/
const express = require('express');
const app = express();
const path = require('path');
const LegoData = require("./modules/legoSets");

const legoData = new LegoData();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Routes
app.get('/', (req, res) => {
    res.render("home", { page: "/" }); 
});

app.get('/about', (req, res) => {
    res.render("about", { page: "/about" });
});

app.get('/lego/sets', (req, res) => {
    if (req.query.theme) {
        legoData.getSetsByTheme(req.query.theme)
            .then(data => {
                res.render("sets", { sets: data, page: "/lego/sets" }); 
            })
            .catch(err => {
                res.status(404).render("404", { message: err, page: "" }); 
            });
    } else {
        legoData.getAllSets()
            .then(data => {
                res.render("sets", { sets: data, page: "/lego/sets" }); 
            })
            .catch(err => {
                res.status(404).render("404", { message: err, page: "" }); 
            });
    }
});

// Theme-based filtering
app.get("/lego/sets/theme/:theme", (req, res) => {
    legoData.getSetsByTheme(req.params.theme)
        .then((sets) => {
            res.render("sets", { sets: sets, page: "/lego/sets" });
        })
        .catch((err) => {
            res.status(404).render("404", { message: err, page: "" });
        });
});

app.get('/lego/sets/:setNum', (req, res) => {
    legoData.getSetByNum(req.params.setNum)
        .then(data => {
            res.render("set", { set: data, page: "" }); 
        })
        .catch(err => {
            res.status(404).render("404", { message: err, page: "" }); 
        });
});

app.get("/lego/addSet", (req, res) => {
  legoData.getAllThemes() 
    .then(themes => {
      res.render("addSet", { themes: themes, page: "/lego/addSet" }); 
    })
    .catch(err => {
      res.status(500).render("500", { message: "Error fetching themes: " + err }); 
    });
});

app.post("/lego/addSet", (req, res) => {
  legoData.addSet(req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => res.status(500).render("500", { message: err }));
});

// Edit Set Page Route (GET)
app.get("/lego/editSet/:set_num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.set_num);
    const themes = await legoData.getAllThemes();
    res.render("editSet", { set, themes, page: "/lego/editSet" });
  } catch (err) {
    res.status(404).render("404", { message: err, page: "" });
  }
});

//Edit Set Submission Route (POST)
app.post("/lego/editSet/:set_num", async (req, res) => {
  try {
    await legoData.updateSet(req.params.set_num, req.body);
    res.redirect("/lego/sets");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

app.get("/lego/deleteSet/:set_num", async (req, res) => {
    try {
        await legoData.deleteSetByNum(req.params.set_num);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(404).render("404", { message: err, page: "" });
    }
});

// fallback 404 route
app.use((req, res) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for.", page: "" }); 
});

legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`server listening on: http://localhost:${HTTP_PORT}`);
        });
    })
    .catch(err => {
        console.error(`Error initializing data: ${err}`);
    });
