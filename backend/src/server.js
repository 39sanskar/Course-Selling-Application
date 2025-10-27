import dotenv from "dotenv"
import connectDB from './db/index.js';
import { app } from './app.js'
dotenv.config({
  path: './.env'
})

connectDB()
.then(() => {
  app.on("error", ()=>{
    console.log("Express app error: , err");
    throw err;
  });

  // ==================== START SERVER ====================
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at port : ${process.env.PORT || 3000}`);
  });
})
.catch((err) => {
  console.log("Database connection failed !!! ", err)
});
