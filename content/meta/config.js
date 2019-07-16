const colors = require("../../src/styles/colors");

module.exports = {
  siteTitle: "3cv-research", // <title>
  shortSiteTitle: "3cv-research", // <title> ending for posts and pages
  siteDescription: "Computer Vision | Machine Learning | GPGPU | HPC",
  siteUrl: "https://blog.3cv-research.com",
  pathPrefix: "",
  siteImage: "preview.jpg",
  siteLanguage: "en",
  // author
  authorName: "Alex Yang",
  authorTwitterAccount: "aleozlx",
  // info
  infoTitle: "Alex Yang",
  infoTitleNote: "PhD Candidate",
  // manifest.json
  manifestName: "3cv-research",
  manifestShortName: "3cv-research", // max 12 characters
  manifestStartUrl: "/",
  manifestBackgroundColor: colors.background,
  manifestThemeColor: colors.background,
  manifestDisplay: "standalone",
  // contact
  contactEmail: "aleozlx@gmail.com",
  // social
  authorSocialLinks: [
    { name: "github", url: "https://github.com/aleozlx" }
    // { name: "twitter", url: "https://twitter.com/aleozlx" },
    // { name: "facebook", url: "http://facebook.com/greglobinski" }
  ]
};
