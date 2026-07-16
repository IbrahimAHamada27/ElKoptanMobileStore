const cors = require('cors');
const { all } = require('../routes/user.route');
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const corsOptions = {
    origin:function (origin, callback) {
        if(!origin) {return cb(null, true);}


        if(allowedOrigins.includes(origin)){
            return (null, true);
        }
        return cb (new Error('cors policy : not allowed origin'));
    },

    cradentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};


module.exports = cors();
