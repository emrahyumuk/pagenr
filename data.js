const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const routes = require('./src/routes');

const fetchOptions = {
  headers: { Accept: 'application/json' },
};

routes.forEach(r => {
  const routeData = {};
  const promiseArray = [];
  if (r.fetch) {
    r.fetch.forEach(f => {
      promiseArray.push(
        new Promise((resolve, reject) => {
          fetch(f.url, Object.assign(fetchOptions, f.options))
            .then(res => res.json())
            .then(res => {
              if (f.callback) {
                callback(res);
              }
              routeData[f.name] = res;
              resolve(res);
            })
            .catch(err => {
              reject(err);
            });
        })
      );
    });
    Promise.all(promiseArray).then(() => {
      const dir = path.join(process.cwd(), './.temp/');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const fileName = path.join(dir, `${r.name}.json`);
      fs.writeFileSync(fileName, JSON.stringify(routeData));
    });
  }
});
