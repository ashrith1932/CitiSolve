const PORT = process.env.port;
const app = require("./app")
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('✅ Test the server: http://localhost:5000/api/test');
  console.log('✅ Session middleware enabled');
});