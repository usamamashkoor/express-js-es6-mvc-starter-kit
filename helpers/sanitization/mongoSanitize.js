import sanitize from 'mongo-sanitize';
function mongoSanitize(v) {
  if (v instanceof Object) {
    for (let key in v) {
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        mongoSanitize(v[key]);
      }
    }
  }
  // console.log('v before')
  // console.log(v)
  v = sanitize(v);
  // console.log('v after')
  // console.log(v)
  return v;
};
export default mongoSanitize;