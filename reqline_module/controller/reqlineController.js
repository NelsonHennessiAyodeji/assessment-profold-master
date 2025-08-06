const axios = require('axios');
const { errorResponse } = require('../errors');

// Helper Function for determining what a header, body, query is.
// Using the try catch, I can make suer there is either an error or a sucessful check.
function isJsonFormat(format) {
  try {
    const parsed = JSON.parse(format);
    return [true, parsed];
  } catch {
    return [false, null];
  }
}

// I had to think hard here, the system that is required can only work with a post request because
// of the payload that we will have to feed it for results, so I'll have to engineer the logic to
// accomodate both POST and GET on the logical/business level. Maybe I'll just let the get send some information
const parseRequest = async (req, res) => {
  const { reqline } = req.body;

  // Error check if there is no value or it is not a string
  if (!reqline || typeof reqline !== 'string') {
    return errorResponse(res, 422, 'Missing or invalid reqline string');
  }

  // Remove the enclosing brackets '[]' from the initial format
  const cleanReqline = reqline.slice(1, -1);

  // Split the statments by the delimiters '|'
  const sections = cleanReqline.split('|').map((section) => section.trim());

  // Prepare the section key value pair parts.
  const sectionParts = {};

  sections.forEach((part) => {
    // The logic here is to use the index of the whitespaces to judge the seperation
    // This is good and possible thanks to the strict requirement
    const spaceDelimiter = part.indexOf(' ');
    if (spaceDelimiter === -1) {
      return errorResponse(res, 400, 'Missing space after keyword');
    }

    // I split off from the beginning to the white space and safe it to get the keyword
    const keyword = part.slice(0, spaceDelimiter).toUpperCase();

    // I continued the splitoff from where the whitespace position was to get the value of the keyword
    const keywordValue = part.slice(spaceDelimiter + 1);

    // AI helped with this logic here, I couldn't for the life of  me automate this next step, this is what happens when you focus toomuch on advancements and ignore the basics because you think you know enough (:
    sectionParts[keyword] = keywordValue;
  });

  // Only Required parts are necessary like http and url not necessarily the query.
  if (!sectionParts.HTTP) {
    return errorResponse(res, 400, 'Missing required HTTP keyword');
  }
  if (!sectionParts.URL) {
    return errorResponse(res, 400, 'Missing required URL keyword');
  }

  // const payload = {
  //   cleanReqline,
  //   length: cleanReqline.length,
  //   sections,
  //   sectionParts,
  // };

  const method = sectionParts.HTTP;
  // Checking if the GET And POST are submitted correctly
  // if (!(method === 'GET' || method === 'POST')) {
  //   return errorResponse(res, 405, 'Invalid HTTP method. Only GET and POST are supported');
  // }
  // A better way of checking... i akmist used too much redundancy with the 'if-else' of the above funtion, this is better and cleaner
  if (!['GET', 'POST'].includes(method)) {
    return errorResponse(res, 405, 'Invalid HTTP method. Only GET and POST are supported');
  }

  // I can use json formats to check and parse the headers queries, bodies and url overall, which is what I
  // did with the json format check function above.
  const url = new URL(sectionParts.URL);
  let headers = {};
  let query = {};
  let body = {};

  // Checking ofr the valiidity of the headers
  if (sectionParts.HEADERS) {
    const [valid, parsed] = isJsonFormat(sectionParts.HEADERS);
    if (!valid) {
      return errorResponse(res, 422, 'Invalid JSON format in HEADERS section');
    }
    headers = parsed;
  }

  // Checking for the query
  if (sectionParts.QUERY) {
    const [valid, parsed] = isJsonFormat(sectionParts.QUERY);
    if (!valid) {
      return errorResponse(res, 422, 'Invalid JSON format in QUERY section');
    }
    query = parsed;

    // The idea is to append the queries using the Object key value function logic to URL assign the queries automatically
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  // Checking for the body as well
  if (sectionParts.BODY) {
    const [valid, parsed] = isJsonFormat(sectionParts.BODY);
    if (!valid) {
      return errorResponse(res, 422, 'Invalid JSON format in BODY section');
    }
    body = parsed;
  }

  // Start counting as soon as the request is sent by axios.
  const start = Date.now();
  try {
    const response = await axios({
      method,
      url: url.href,
      headers,
      data: body,
    });
    // Stop counting as soon as the axios request is done.
    const stop = Date.now();

    // Copy pasted exactly as requested...
    res.status(200).json({
      request: {
        query,
        body,
        headers,
        full_url: url.href,
      },
      response: {
        http_status: response.status,
        duration: stop - start,
        request_start_timestamp: start,
        request_stop_timestamp: stop,
        response_data: response.data,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, `Request failed: ${error.message}`);
  }
};

module.exports = parseRequest;
