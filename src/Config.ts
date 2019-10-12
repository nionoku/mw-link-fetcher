import "reflect-metadata";
// -- env config --
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "config/env/.env" });
}
// -- env config --
