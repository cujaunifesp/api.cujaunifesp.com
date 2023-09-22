Date.prototype.toUTCDateTimeString = function () {
  return this.toISOString().slice(0, 23).replace("T", " ");
};
