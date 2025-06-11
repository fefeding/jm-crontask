
const package = require('./package.json');
process.env.NODE_ENV = 'production';
//process.env.PORT = 8091;
process.title = process.env.SERVICE_NAME = process.env.SERVICE_NAME || package.name || 'ycnull-server';
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run().then(() => {
    console.log(process.env.PORT);
});
