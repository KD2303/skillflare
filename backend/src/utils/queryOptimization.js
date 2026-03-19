/**
 * Query optimization utilities for better scalability.
 * Provides pagination, lean queries, and field selection helpers.
 */

/**
 * Parse pagination parameters from request
 * @param {object} query - Query object from request
 * @returns {object} { page, limit, skip }
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page || 1));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || 10))); // Max 100 items per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build pagination response metadata
 * @param {number} total - Total document count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
export const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

/**
 * Build select string for mongoose to optimize query
 * @param {string[]} fields - Fields to include
 * @returns {string} Mongoose select string
 */
export const buildSelectString = (fields = []) => {
  return fields.join(" ");
};

/**
 * Wrapper for common list operations with pagination and lean
 * @param {Model} model - Mongoose model
 * @param {object} filter - Query filter
 * @param {string} select - Fields to select (optional)
 * @param {object} populate - Populate options (optional)
 * @param {object} paginationParams - { page, limit, skip }
 * @returns {Promise}
 */
export const getListWithPagination = async (
  model,
  filter = {},
  select = "",
  populate = null,
  paginationParams = { skip: 0, limit: 10 },
) => {
  let query = model.find(filter);

  if (select) {
    query = query.select(select);
  }

  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((p) => {
        query = query.populate(p);
      });
    } else {
      query = query.populate(populate);
    }
  }

  const total = await model.countDocuments(filter);
  const items = await query
    .sort({ createdAt: -1 })
    .skip(paginationParams.skip)
    .limit(paginationParams.limit)
    .lean()
    .exec();

  return {
    items,
    meta: getPaginationMeta(
      total,
      Math.floor(paginationParams.skip / paginationParams.limit) + 1,
      paginationParams.limit,
    ),
  };
};

export default {
  getPaginationParams,
  getPaginationMeta,
  buildSelectString,
  getListWithPagination,
};
