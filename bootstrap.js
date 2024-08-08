process.env.NODE_ENV = 'production';
//process.env.PORT = 8091;
process.title = 'school-server';
const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.run().then(() => {
    console.log(process.env.PORT);
});
