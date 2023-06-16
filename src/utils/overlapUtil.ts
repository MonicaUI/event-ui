/*
 * this function takes an array of date ranges in this format:
 * [{ startTime: ‘2018-07-03T19:53:58.570Z’, endTime: ‘2018-07-03T19:53:58.570Z’}]
 * the array is first sorted, and then checked for any overlap
 */

export function overlap(dateRanges: $TSFixMe): $TSFixMe {
  const sortedRanges = dateRanges.sort((previous, current) => {
    // get the start date from previous and current
    if (previous.startTime === undefined || current.startTime === undefined) {
      return 0;
    }
    const previousTime = new Date(previous.startTime).getTime();
    const currentTime = new Date(current.startTime).getTime();
    // if the previous is earlier than the current
    if (previousTime < currentTime) {
      return -1;
    }
    // if the previous time is the same as the current time
    if (previousTime === currentTime) {
      return 0;
    }
    // if the previous time is later than the current time
    return 1;
  });

  const overlapResult = sortedRanges.reduce(
    (result, current, idx, arr) => {
      // get the previous range
      if (idx === 0) {
        return result;
      }
      const previous = arr[idx - 1];
      // To match the service behavior, removing all null cases.
      if (
        previous.startTime === undefined ||
        current.endTime === undefined ||
        previous.endTime === undefined ||
        current.startTime === undefined
      ) {
        if (
          (current.endTime === undefined || previous.endTime === undefined) &&
          new Date(previous.startTime).getTime() === new Date(current.startTime).getTime()
        ) {
          result.overlap = true;
          result.ranges.push({
            previous,
            current
          });
        }
        return result;
      }
      // check for any overlap
      const previousEnd = new Date(previous.endTime).getTime();
      const currentStart = new Date(current.startTime).getTime();
      const overlapFlag = previous.id !== current.id && previousEnd > currentStart;

      // store the result
      if (overlapFlag) {
        // yes, there is overlap
        /* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["result"] }] */
        result.overlap = true;
        // store the specific ranges that overlap
        result.ranges.push({
          previous,
          current
        });
      }
      return result;
    },
    {
      overlap: false,
      ranges: []
    }
  );
  return overlapResult;
}
