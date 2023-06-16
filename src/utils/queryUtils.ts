import qs from 'querystring';

export function stripQueryParams(url: $TSFixMe, paramsToRemove: $TSFixMe): $TSFixMe {
  const splitUrl = url.split('?');
  const path = splitUrl[0];
  const query = qs.parse(splitUrl[1]) || {};
  paramsToRemove.forEach(param => delete query[param]);
  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
}

export function addQueryParams(url: $TSFixMe, paramsToAdd: $TSFixMe): $TSFixMe {
  const splitUrl = url.split('?');
  const path = splitUrl[0];
  const query = qs.parse(splitUrl[1]) || {};
  for (const key in paramsToAdd) {
    if ({}.hasOwnProperty.call(paramsToAdd, key)) {
      query[key] = paramsToAdd[key];
    }
  }
  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
}

// retrieves query parameter case insenstively
export function getQueryParam(queryParams: $TSFixMe, key: $TSFixMe): $TSFixMe {
  for (const fieldName of Object.keys(queryParams)) {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (fieldName && fieldName.toLowerCase && fieldName.toLowerCase() === key.toLowerCase()) {
      return queryParams[fieldName];
    }
  }
}

/*
 * persistRegtype indicates whether we need to persist the reg type in state
 * for example, if reg type was pre-defined as query param in registration url,
 * we should always persis that reg type whenever user creates a new registration within current registration
 * otherwise, we should clean up the reg type right after user logout
 */
const REGISTRATION_TYPE_QUERY_PARAM = ['rt', 'registrationTypeId'];
export function getPersistRegType(queryParams: $TSFixMe): $TSFixMe {
  // checks whether pre-defined regTypeId in URL
  const isRegTypeInQueryParams = regTypeQueryParam => regTypeQueryParam in queryParams;
  return REGISTRATION_TYPE_QUERY_PARAM.some(isRegTypeInQueryParams);
}
