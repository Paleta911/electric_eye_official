function absoluteUrl(req, pathname) {
  return `${req.protocol}://${req.get('host')}${pathname}`;
}

module.exports = { absoluteUrl };
