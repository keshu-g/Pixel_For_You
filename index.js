const express = require('express');

const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')
const app = express();
const User = require('./models/Users')
const jwt = require('jsonwebtoken');
app.use(express.static('public'));
// app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(authRoutes)
app.use(cookieParser());

// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const dbURI = 'mongodb+srv://spikeisgreen:spike420@firstpixel.4abuxdp.mongodb.net/UserData'
mongoose.connect(dbURI).then((results) => app.listen(3000)).catch((err) => console.log(err))


app.get('*', checkUser);
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.post('/home', async (req, res) => {
    let images = await User.find(
        {
            "uploads.caption":
            {
                $exists: true
            }
        },   // Query condition: where "uploads" field exists
        {
            username: 1,
            uploads: 1,
            _id: 0
        }           // Projection: Include only the "uploads" field and exclude "_id" field
    );
    // console.log("Images")
    // console.log(images)
    res.json(images);
    // return;
})

app.get('/upload', requireAuth, (req, res) => {
    res.render('upload');
});
app.post('/upload', requireAuth, async (req, res) => {
    const { image64, caption } = req.body;
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, 'keshusecret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            }
            else {
                // console.log(decodedToken);
                // let user = await User.findById(decodedToken.id)
                let imageupdate = await User.updateOne({ _id: decodedToken.id },
                    {
                        $push: {
                            uploads: {
                                caption: caption,
                                image64: image64
                            },
                        }
                    })
                console.log(imageupdate);
                res.redirect('/home');
                // res.status(200).json('Image uploaded successfully');
                // return;
            }
        })
    }
    else {
       res.redirect('/login');
    }

});


// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });
