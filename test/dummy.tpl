
function dummy(next) {
  next();
}

exports.up = dummy;
exports.down = dummy;
