var fs = require('fs');
const mysql = require('mysql');
const state = {
    pool:null
};

exports.connect = function(done){
    state.pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.SENG365_MYSQL_HOST || 'localhost',
        port: process.env.SENG365_MYSQL_PORT || '3306',
        user: 'admin',
        password: 'admin',
        database: 'confluence',
        multipleStatements: true
    });
    let count = 0;
    var timer = setInterval(function(){state.pool.getConnection(function (err, connection) {
        if(err){
            count += 1;
            console.log('Cannot connect database, count times = ' + count +', max count number is 5');
            if (count == 5){
                console.log('stop connecting database, please check deployment');
                process.exit(1);
            }
        }
        else {
            clearInterval(timer);
            /*create tables*/
            let create_table = fs.readFileSync('confluence_table.sql').toString();

            connection.query(create_table, function (err, result) {
                if(!err){
                    console.log('success to create tables');
                }else{
                    console.log(err);
                }
            });
            state.pool.multipleStatements = false;
            connection.release();
        }


    });

    }, 2000);
    done();
};

exports.get = function () {
    return state.pool;
};

exports.post = function () {
    return state.pool;
};

exports.put = function () {
    return state.pool;
};

exports.delete = function () {
    return state.pool;
};