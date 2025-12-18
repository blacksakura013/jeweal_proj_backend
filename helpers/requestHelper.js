exports.omitFields = (obj, fieldsToOmit)=>{
    const result = { ...obj };
    fieldsToOmit.forEach(field => delete result[field]);
    return result;
  }
