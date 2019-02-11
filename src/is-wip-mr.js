exports.isWipMr = mrTitle => {
  const wipPrefixBracket = mrTitle
    .toLowerCase()
    .trim()
    .slice(0, 5);
  if (wipPrefixBracket === '[wip]') {
    return true;
  }
  const wipPrefixColon = wipPrefixBracket.slice(0, 4);
  if (wipPrefixColon === 'wip:') {
    return true;
  }
  return false;
};
