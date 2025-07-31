const { PrismaClient } = require('@prisma/client');
require("dotenv").config();

const prisma = new PrismaClient();

exports.dbConnect = async () => {
  try {
    await prisma.$connect();
    console.log("Connection with PostgreSQL database successful");
  } catch (error) {
    console.log("Error while connecting to database");
    console.error(error);
    process.exit(1);
  }
};

exports.prisma = prisma;
