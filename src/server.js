const app = require('./app');
const { PORT } = require('./config');

app.listen(PORT, () => {
  console.log(`TASKFLOW API çalışıyor: http://localhost:${PORT}`);
});
