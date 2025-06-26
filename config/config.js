import dotenv from "dotenv";
dotenv.config();

const getConfigs = () => {
  return {
    morgan: {
      logStyle: "dev",
    },
    cors: {
      origin: [
        "http://localhost:5173",
        "https://quirky-roomie-frontend-two.vercel.app",
      ],
      credentials: true,
    },
    server: {
      name: "Quirky Roomie",
      port: process.env.PORT || 2001,
      baseURl: "/",
      APP_URL: process.env.APP_URL,
      serverId: "1",
      version: "V1",
      appBaseUrl: "/auth",
    },
    mongo: {
      url: process.env.MONGODB_URI,
    },
    jwt: {
      accessSecret: process.env.ACCESS_TOKEN_SECRET,
      accessOptions: {
        expiresIn: process.env.JWT_EXPIRES,
      },
    },
    salt: {
      salt: process.env.SALT,
    },
    cookie: {
      cookie_expire: process.env.COOKIE_EXPIRE,
    },
  };
};

export default getConfigs;
