const request = require("request");
const retrieve = url => {
  request.get(url, (err, res, body) => {
    const regex = /("|')(http(s)?:\/\/(.)+\.m3u8.*)("|')/g;
    let match;
    while ((match = regex.exec(body))) {
      console.log(match[2]);
      console.log("\n");
    }
  });
};
const trial = url => {
  request.get(url, (err, res, body) => {
    const regex = /<iframe src="(http(s)?:\/\/.+?)"/g;
    let match;
    while ((match = regex.exec(body))) {
      retrieve(match[1]);
    }
  });
};
let input = process.argv.slice(2)[0];
let link = `http://gooool.org/player?newsid=${input}`;
trial(link);
