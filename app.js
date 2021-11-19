var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

const bodyParser = require('body-parser');
const cors = require('cors');
const port = 8080;

// Debugging
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Set-up Mongo DB
var mongoose = require('mongoose');
var url = "mongodb+srv://keechu0613:keechu0613@cluster0.pk3ai.mongodb.net/Contact?retryWrites=true&w=majority";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!");
});

// Set-up Email User Schema
const EmailUserSchema = new mongoose.Schema({
    username: String,
    email: String,
    title: String,
    content: String,
    replyAlready: Boolean
});

// Set-up Feedback User Schema
const FeedbackUserSchema = new mongoose.Schema({
    nameFeedback: String,
    emailFeedback: String,
    contentFeedback: String,
});

// User == jasmin
const EmailUser = mongoose.model('EmailUser', EmailUserSchema);
const FeedbackUser = mongoose.model('FeedbackUser', FeedbackUserSchema);

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// ========================================================== Index.pug ====================================================

// Index.pug Sending Email to Company
app.post('/route', (req, res) => {
    // Output the user input (message) to the console for debugging
    let message = req.body;
    console.log(message);
    // res.send('User email is saved to the server');
    // res.send(message);

    // Start Sending Email
    const nodemailer = require('nodemailer');

    // Generate SMTP service account from ethereal.email
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }
        console.log('Credentials obtained, sending message...');

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'felix.rogahn@ethereal.email',
                pass: 'Ja5Xkeq73pNvp3D2vr'
            }
        });

        // Message object
        let message = {
            from: req.body.email,
            to: 'Recipient <felix.rogahn@ethereal.email>',
            subject: req.body.title,
            text: req.body.content,
            html: req.body.content,
            // html: '<p><b>Hello</b> req.body.content</p>'
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

    // const user1 = new User({ name: "potatouser001", email:5,birthday:new Date("2015-01-12")});
    const user1 = new EmailUser(message);
    user1.save(function (err, user1) {
        req.body.replyAlready = true;
        console.log(req.body.replyAlready);
        if (err) return console.error(err);
    });
});

// Index.pug Send Feedback and Store Into Database
app.post('/feedback', (req, res) => {
    let message = req.body;
    console.log(message);
    // res.send('User feedback is saved to the server');

    // Start Feedback Mailer
    const nodemailer = require('nodemailer');

    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }
        console.log('Credentials obtained, sending message...');

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'felix.rogahn@ethereal.email',
                pass: 'Ja5Xkeq73pNvp3D2vr'
            }
        });

        // Message object
        let message = {
            from: req.body.anonymousEmail,
            to: 'Recipient <felix.rogahn@ethereal.email>',
            subject: req.body.anonymousName,
            text: req.body.anonymousContent,
            html: req.body.anonymousContent,
            // html: '<p><b>Hello</b> req.body.content</p>'
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

    // Store User into MongoDB (Feedback)

    const feedbackuser1 = new FeedbackUser(message);
    feedbackuser1.save(function (err, feedbackuser1) {
        // req.body.replyAlready = true;
        // console.log(req.body.replyAlready);
        if (err) return console.error(err);
    });
});



// ============================================================ Admin.pug ====================================================

// Admin.pug Read All the Email From the Database
app.post('/read/all', (req, res) => {
    EmailUser.find({}, function (err, result) {
        if (err) {
            return console.error(err);
        } else {
            // console.log(emaildata);
            console.log('EMAILLLLLL ADA SINIIIII');
            return res.json(result);
        }
    })
});

// Admin.pug Select Waiting List from Database
app.post('/waitingListEmail', (req, res) => {
    EmailUser.find({replyAlready:false}, function (err, result) {
        if (err) {
            return console.error(err);
        } else {
            // console.log(emaildata);
            console.log('Waiting Reply Listttttttttttttt');
            return res.json(result);
            // res.render("admin", { details: emaildata })
        }
    })
});

// Admin.pug Select Already Replied List from Database
app.post('/alreadyReplyEmail', (req, res) => {
    EmailUser.find({replyAlready:true}, function (err, result) {
        if (err) {
            return console.error(err);
        } else {
            // console.log(emaildata);
            console.log('Already Reply Listttttttttttttt');
            return res.json(result);
            // res.render("admin", { details: emaildata })
        }
    })
});

// Admin.pug Read Feedback from Database
app.post('/read/allFeedback', (req, res) => {
    FeedbackUser.find({}, function (err, result) {
        if (err) {
            return console.error(err);
        } else {
            console.log('FEEDBACKKKKKKKK SINIIIII');
            return res.json(result);
            // res.render("admin", { details: emaildata })
        }
    })
});

// Admin.pug Reply to the Customer
app.post('/reply', (req, res) => {
    let message = req.body;
    console.log(message);
    res.send('Company Already Reply the Message');

    // ========== Start Feedback Mailer =============
    const nodemailer = require('nodemailer');

    nodemailer.createTestAccount((err, account) => {
        if (err){
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }
        console.log('Credentials obtained, sending message...');

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'felix.rogahn@ethereal.email',
                pass: 'Ja5Xkeq73pNvp3D2vr'
            }
        });

        // Message object
        let message = {
            from: req.body.inputReplyUserEmail,
            to: 'Recipient <felix.rogahn@ethereal.email>',
            subject: req.body.inputSenderTitle,
            text: req.body.inputSenderContent,
            html: req.body.inputSenderContent,
            // html: '<p><b>Hello</b> req.body.content</p>'
        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });


        // Update the replyAlready
        EmailUser.findOneAndUpdate({_id: req.body._id}, {$set:{replyAlready: true}}, function (err, result){
            if (err) {
                console.log(err);
                console.log("fail larrrrrrrr");
            } else {
                console.log(result);
                console.log("happy birthdayyyyyyyyyyyyyyyyyyyyyyyyy");
                console.log(req.body._id);
                console.log("successss larhhhhhh");
            }
        });
    });
});



// Testing
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// app.use(function (err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};
//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

module.exports = app;
