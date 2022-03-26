module.exports = {
  apps : [{
    name   : "thermo-back",
    script : "./dist/index.js",
    env: {
       PORT: 3002
    }
  }]
}
