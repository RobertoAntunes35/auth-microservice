import { Sequelize } from "sequelize";

import {config} from 'dotenv'


config()
const database = process.env.POSTGRES_DB!
const user = process.env.POSTGRES_USER!
const password = process.env.POSTGRES_PASSWORD!
const host = process.env.POSTGRES_HOST!
const port:number = Number(process.env.POSTGRES_PORT!)

const sequelize: Sequelize = new Sequelize(database, user, password, {
    host: host,
    port: port,
    dialect: 'postgres',
    quoteIdentifiers: false,
    define: {
        timestamps: false,
        underscored: true,
        freezeTableName: true,
    }
})

// const sequelize = new Sequelize('postgres://postgres:1234@localhost:5434/auth_api')
sequelize
    .authenticate()
    .then(() => {
        console.info("Connection has been stablished")
    })
    .catch((err) => {
        console.error("Unable to connect to the database")
        console.info(err.message)
    })




export default sequelize