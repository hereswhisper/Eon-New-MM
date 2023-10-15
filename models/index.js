const mongoose = require("mongoose");
require('dotenv').config();

class Database {
    constructor() {

    }

    connect() {
        if (process.env.USE_MYSQL == "false") {
            mongoose
                .connect(
                    process.env.MONGO_DB,
                    {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                    }
                )
                .then(() => {
                    console.log(`[EON-DB] Successfully connected to database using MONGO_DB`);
                })
                .catch((err) => {
                    console.log(`[EON-DB] Failed -> ${err}`);
                });
        } else {
            throw new Error("Eon Matchmaker currently does not support MySQL. It will be supported on a future version!")
        }

    }
}

module.exports = Database