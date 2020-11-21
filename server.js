const express = require("express");
const { ApolloServer, PubSub } = require("apollo-server-express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary");
const cors = require("cors");
const { makeExecutableSchema } = require("graphql-tools");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");
require("dotenv").config();
const { authCheck, authCheckMiddleware } = require("./helpers/auth");
const nodemailer = require("nodemailer");
const pubsub = new PubSub();

const credentials = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // These environment variables will be pulled from the .env file
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};
const transporter = nodemailer.createTransport(credentials);
transporter.verify((error, success) => {
  if (error) {
    //if error happened code ends here
    console.error(error);
  } else {
    //this means success
    console.log("users ready to mail myself");
  }
});

// Express server
const app = express();

// db
const db = async () => {
  try {
    const success = await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("DB connected on ", process.env.DATABASE);
  } catch (error) {
    console.log(error);
  }
};
// Execute database connection
db();

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, "./typeDefs")),
);
// resolvers
const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, "./resolvers")),
);

// GraphQL server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

// applyMiddleware method connect ApolloServer to a specific HTTP framework
apolloServer.applyMiddleware({ app });

// server
const httpserver = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpserver);

// Rest endpoint
app.get("/rest", authCheck, function (req, res) {
  res.json({
    data: "You hit rest endpoint",
  });
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post("/uploadimages", authCheckMiddleware, (req, res) => {
  cloudinary.uploader.upload(
    req.body.image,
    (result) => {
      console.log(result);
      res.send({
        url: result.secure_url,
        public_id: result.public_id,
      });
    },
    {
      public_id: `${Date.now()}`, //Public name
      folder: "thomas-gil-graphql",
      ressource_type: "auto", //JPEG,PNG ...
    },
  );
});
// remove image
app.post("/removeimage", authCheckMiddleware, (req, res) => {
  let image_id = req.body.public_id;

  cloudinary.uploader.destroy(image_id, (error, result) => {
    if (error) {
      console.log(image_id);
      return res.json({ success: false, error });
    }
    res.send("ok");
  });
});

app.post("/emailToMe", (req, res, next) => {
  const mail = {
    from: req.body.email,
    to: "tgil849@gmail.com",
    subject: req.body.email,
    text: `
      from:
      ${req.body.email} 
      subject:
      ${req.body.subject}
      message: 
      ${req.body.message}`,
  };
  console.log(req.body);
  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "success",
      });
    }
  });
});

httpserver.listen(process.env.PORT, function () {
  console.log(`server is running at http://localhost:${process.env.PORT}`);
  console.log(
    `graphql server is running at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`,
  );
  console.log(
    `subscription is ready at http://localhost:${process.env.PORT}${apolloServer.subscriptionsPath}`,
  );
});
module.exports = httpserver;
