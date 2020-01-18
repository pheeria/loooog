const request = require("request");
const { JSDOM } = require("jsdom");
const promtps = require("prompts");

const main = () =>
  request.get("http://gooool.org/", (err, res, body) => {
    const dom = new JSDOM(body);
    let choices = [];

    dom.window.document.querySelectorAll("td").forEach(td => {
      if (td.innerHTML.includes("color:#23ff00")) {
        const allMatches = /"(http(s)?:\/\/.+?)"/g;
        let match;

        while ((match = allMatches.exec(td.innerHTML))) {
          const info = /(\d+)-([a-z]+)-([a-z]+)/gim;
          let innerMatch;
          while ((innerMatch = info.exec(match[1]))) {
            choices.push({
              title: `${innerMatch[2]} - ${innerMatch[3]}`,
              value: innerMatch[1]
            });
          }
        }
      }
    });

    showMenu(choices);
  });

const findSources = url => {
  request.get(url, (err, res, body) => {
    const regex = /("|')(http(s)?:\/\/(.)+\.m3u8.*)("|')/g;
    let match;
    while ((match = regex.exec(body))) {
      console.log(`"${match[2]}"`);
    }
  });
};
const findIframes = url => {
  request.get(url, (err, res, body) => {
    const regex = /<iframe src="(http(s)?:\/\/.+?)"/g;
    let match;
    while ((match = regex.exec(body))) {
      findSources(match[1]);
    }
  });
};

const showMenu = choices =>
  promtps({
    type: "select",
    name: "value",
    message: "Pick a match",
    choices: choices,
    initial: 1
  }).then(res => findIframes(`http://gooool.org/player?newsid=${res.value}`));

main();
