const _ = require("lodash");

class QueryHelper {
  constructor(query, options = {}, defaultFilter = { deactivated: false }) {
    this.query = query;
    this.defaultFilter = _.cloneDeep(defaultFilter);
    this.options = options;
    this.defaultUnFilters = [
      "page",
      "limit",
      "search",
      "sort",
      "city",
      "salary",
      "own",
      "minPrice",
      "maxPrice",
      "budget",
    ];

    this.initOptions();
    this.initFilter();
  }

  initOptions() {
    const {
      page = 1,
      limit = 5,
      unFilter = [],
      searchFields = ["title"],
      sort: initialSort = { createdAt: -1 },
      customFilters,
      customLabels = { docs: "docs" },
      customPopulate = [],
      customSelect = null,
    } = this.options;

    this.page = _.toInteger(this?.query?.page || page);
    this.limit = _.toInteger(this?.query?.limit || limit);
    this.searchFields = searchFields;
    this.initialSort = initialSort;
    this.customFilters = customFilters;
    this.customLabels = customLabels;
    this.customPopulate = customPopulate;
    this.customSelect = customSelect;
    this.sort = this.query?.sort === "asc" ? { createdAt: 1 } : initialSort;
    this.effectiveUnFilter = _.union(this.defaultUnFilters, unFilter);
  }

  initFilter() {
    this.filter = _.cloneDeep(this.defaultFilter);

    // Search Filtering
    if (this.query?.search && !_.isEmpty(this.searchFields)) {
      const searchRegex = new RegExp(this.query.search, "i");
      this.filter[
        this.searchFields.length === 1 ? this.searchFields[0] : "$or"
      ] =
        this.searchFields.length === 1
          ? searchRegex
          : this.searchFields.map((field) => ({ [field]: searchRegex }));
    }

    // Location Filtering
    if (this.query?.city) {
      _.set(this.filter, "location.city", new RegExp(this.query.city, "i"));
    }

    // Salary Range Filtering
    if (this.query?.salary) {
      const salaryValue = _.isArray(this.query.salary)
        ? this.query.salary
        : _.split(this.query.salary, ",").map(_.toNumber);

      this.filter.salaryRange = _.pickBy(
        {
          $gte: salaryValue[0],
          $lte: salaryValue[1],
        },
        _.identity
      );
    }

    // Budget Filtering
    if (this.query?.budget) {
      _.set(this.filter, "budget", { $gte: this.query.budget });
    }

    // Price Range Filtering
    if (this.query?.minPrice || this.query?.maxPrice) {
      this.filter.price = _.pickBy(
        {
          $gte: this.query.minPrice,
          $lte: this.query.maxPrice,
        },
        _.identity
      );
    }

    // Add remaining filters dynamically
    _.forEach(this.query, (value, key) => {
      if (!this.effectiveUnFilter.includes(key)) {
        this.filter[key] = value;
      }
    });

    // Apply custom filters if provided
    if (_.isFunction(this.customFilters)) {
      this.customFilters(this.filter, this.query, this.options);
    }
  }

  getConfig() {
    return {
      filter: this.filter,
      options: {
        page: this.page,
        limit: this.limit,
        sort: this.sort,
        lean: true,
        customLabels: this.customLabels,
        populate: this.customPopulate,
        select: this.customSelect,
      },
    };
  }
}

const createQueryHelper = (query, options = {}) => {
  const queryHelper = new QueryHelper(query, options);
  return {
    filter: queryHelper.filter,
    options: queryHelper.options
  };
};


module.exports = createQueryHelper;
