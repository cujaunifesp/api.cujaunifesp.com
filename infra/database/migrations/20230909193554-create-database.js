"use strict";

module.exports = {
  async up(queryInterface) {
    queryInterface.createDatabase(getDatabaseName());
  },

  async down(queryInterface) {
    queryInterface.dropDatabase(getDatabaseName());
  },
};

function getDatabaseName() {
  const mainName = `cuja_${process.env.NEXT_PUBLIC_VERCEL_ENV}`;
  const isPreviewEnv = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
  const database = isPreviewEnv
    ? `${mainName}_${process.env.VERCEL_GIT_PULL_REQUEST_ID}`
    : mainName;
  return database;
}
