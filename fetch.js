const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const promtps = require("prompts");

const get = async url => {
  let result = "";
  try {
    result = await fetch(url).then(res => res.text())
  } catch(ex) {
    // Connection Refused
  }
  return result;
};

const findAllLiveMatches = html => {
  const result = [];

  const dom = new JSDOM(html);

  dom.window.document.querySelectorAll("td").forEach(td => {
    if (td.innerHTML.includes("color:#23ff00")) {
      const allMatches = /"(http(s)?:\/\/.+?)"/g;
      let match;

      while ((match = allMatches.exec(td.innerHTML))) {
        const info = /(\d+)-([a-z]+)-([a-z]+)/gim;
        let innerMatch;
        while ((innerMatch = info.exec(match[1]))) {
          result.push({
            title: `${innerMatch[2]} - ${innerMatch[3]}`,
            value: innerMatch[1]
          });
        }
      }
    }
  });

  return result;
};

const showMenu = async choices =>
  await promtps({
    type: "select",
    name: "value",
    message: "Pick a match",
    initial: 0,
    choices
  }).then(res => res.value);

const findIframes = async selectedMatch => {
  const result = [];

  const url = `http://gooool.org/player?newsid=${selectedMatch}`;

  await get(url).then(body => {
    const regex = /<iframe src="(http(s)?:\/\/.+?)"/g;
    let match;
    while ((match = regex.exec(body))) {
      result.push(match[1]);
    }
  });

  return result;
};

const findSources = async url => {
  const result = [];

  const body = await get(url);

  const regex = /("|')(http(s)?:\/\/(.)+\.m3u8.*)("|')/g;
  let match;
  while ((match = regex.exec(body))) {
    result.push(`"${match[2]}"`);
  }

  return result;
};

const main = async () => {
  try {
    const html = await get("http://gooool.org/");
    const allLiveMatches = findAllLiveMatches(html);
    const selectedMatch = await showMenu(allLiveMatches);
    const iframes = await findIframes(selectedMatch);
    const sources = await Promise.all(iframes.map(findSources));

    console.log(sources.filter(Boolean).join(" "));
  }
  catch (ex) {
    console.error(ex);
  }
};

main();
