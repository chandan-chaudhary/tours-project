class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //FILTERING
    // console.log('req.query: ', this.queryString);
    // OBTAIN QUERY
    // we destructured object to new object to manupalte copy and keep original query
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'fields', 'limit'];
    //deleting feilds matched with excludedfields array
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log('queryObj: ', queryObj);

    //ADVANCE FILTERING
    let queryStr = JSON.stringify(queryObj);
    /*
     * to check and replace with exact verbs we use \b on both end
     *to check this query multiple time we used /g means global
     */
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`),
    );
    // console.log('queryStr: ', queryStr);
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    //SORTING
    if (this.queryString.sort) {
      const sortQuery = this.queryString.sort.split(',').join(' ');
      // console.log(sortQuery);
      this.query = this.query.sort(sortQuery);
    } else {
      //currently no effect in sorting bcoz all data was imported at once
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  //FIELDS LIMITING
  limit() {
    if (this.queryString.fields) {
      const fieldQuery = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldQuery);
    } else {
      // this will hide __v from data.
      this.query = this.query.select('-__v');
    }
    return this;
  }

  //PAGINATION AND LIMIT
  paginate() {
    if (this.queryString.page) {
      const page = Number(this.queryString.page) || 1;
      const limit = Number(req.query.limit) || 2;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

module.exports = APIfeatures;
