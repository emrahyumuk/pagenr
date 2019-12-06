const routes = [
  {
    name: 'index',
    title: 'Home',
    fetch: [
      { url: 'http://dummy.restapiexample.com/api/v1/employees', name: 'employees', options: {} },
    ],
  },
  {
    name: 'about',
    title: 'About',
  },
];

module.exports = routes;
