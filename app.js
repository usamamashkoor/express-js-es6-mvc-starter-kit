// Include the cluster module
import cluster from "cluster";
import sticky from "sticky-session";
// Adding the clustring in Node.Js Express.js For multiThreading
// Code to run if we're in the master process
// let a = '';

/**
 * Module dependencies.
 */
import express from "express";
import compression from "compression";
import session from "express-session";
import bodyParser from "body-parser";
import logger from "morgan";
import rfs from "rotating-file-stream";
import chalk from "chalk";
import errorHandler from "errorhandler";
import lusca from "lusca";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import bunyan from "bunyan";
import expressStatusMonitor from "express-status-monitor";
import sass from "node-sass-middleware";
import multer from "multer";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import url from "url";
import moment from "moment";
import sio_redis from "socket.io-redis";
import cors from "cors";

// const upload = multer({ dest: path.join(__dirname, "uploads") });
import nocache from "nocache";
import onHeaders from "on-headers";
import http from "http";
import socketIo from 'socket.io';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: ".env" });

/**
 * API keys and Passport configuration.
 */

/**
 * Create Express server.
 */

// ROUTES
// ==============================================
express.application.prefix = express.Router.prefix = function (
  path,
  configure
) {
  var router = express.Router();
  this.use(path, router);
  configure(router);
  return router;
};
const app = express();

const server = http.createServer(app);

// var server = require("http").Server(app);
// const io = require('socket.io')(server);
const io = socketIo(server);

io.set('transports', ['websocket']);
io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
app.set('socketio', io);
// place this middleware before any other route definitions
// makes io available as req.io in all request handlers
app.use(function(req, res, next) {
  req.io = io;
  next();
});

/**
 * Connect to MongoDB.
 */
// console.log('process.env.MONGODB_URI')
// console.log('process.env.MONGODB_URI')
// console.log(process.env.MONGODB_URI)
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});

/**
 * Express configuration.
 */
app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
// app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set(
  "port",
  process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(cookieParser());
// app.use(expressStatusMonitor());
app.use(expressStatusMonitor({ websocket: io, port : app.get('port') }));
app.use(compression());
app.use(
  sass({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
  })
);
app.use(logger("dev"));
// Write logs to file but it is not working on live server due to less permissions
// create a rotating write stream
let accessLogStream = rfs.createStream('node_js_access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs')
})

app.use(logger('dev', { stream: accessLogStream }))
app.use(logger('combined', { stream: accessLogStream }))

app.use(methodOverride());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.json())
// app.use(expressValidator());
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// console.log(db)
// console.log('db')
app.use(
  session({
    resave: true,
    // saveUninitialized: false,
    saveUninitialized: true,
    secret: "ddjdjk@A((&A@i122Pos@as",
    // secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      // autoReconnect: true,
      // resave: false,
      mongooseConnection: db,
      collectionName: "sessions",
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  console.log('req.path')
  console.log('req.path')
  console.log(req.path)
  // if (req.path === '/api') {
  if (req.path.startsWith("/api") || req.path.startsWith("/webhook")) {
    next();
  } else {
    lusca.csrf()(req, res, next);
    // next();
  }
});
// app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.disable("x-powered-by");
app.use((req, res, next) => {
  // we can access req.user because passport.js adds it their
  res.locals.user = req.user;
  next();
});

app.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);


const whitelist = ['http://localhost:3000','http://localhost:3001',undefined,'http://localhost:5000',
  'https://websiteurl.com/','https://websiteurl.com','https://api.websitename.com',
];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    // console.log('origin')
    // console.log('origin')
    // console.log(origin)
    if(whitelist.includes(origin))
      return callback(null, true)
      callback(new Error('Not allowed by CORS'));
  }
}

app.use(cors(corsOptions));



// This sets four headers, disabling a lot of browser caching:
// Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
// Pragma: no-cache
// Expires: 0
// Surrogate-Control: no-store
app.use(nocache());
app.set("etag", false);

// Controllers
/**
 * Primary app routes.
 */
import HomeController from './controllers/HomeController.js';
import userApiRoutes from './routes/users/userApiRoutes.js';

app.get('/',HomeController.home);

app.use('/api/users', userApiRoutes);


// runProcess();
if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error("err");
    console.error(err);
    res.status(500).send("Server Error");
  });
}

app.locals.env = process.env;

/**
 * Start Express server.
 */
// Working Code
// server.listen(app.get('port'), () => {
// // app.listen(app.get('port'), () => {
//     console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
//   console.log('  Press CTRL-C to stop\n');
// });

// End Working Code
// Clustering code commenting for 
let port = app.get("port");

if (!sticky.listen(server, port)) {
  server.once("listening", function () {
    console.log("Server started on port " + port);
  });

  if (cluster.isMaster) {
    console.log("Master server started on port " + port);
  }
} else {
  console.log(
    "- Child server started on port " +
      port +
      " case worker id=" +
      cluster.worker.id
  );
}

export default app;
