const db = require('../../config/db.js');
const fs = require('fs');

exports.insert_3dmodel= function(name, fileURL, done){

    let my_data = [name, fileURL];
    let sql = 'INSERT INTO 3DModels (name, url) VALUES (?,?);';
    db.post().query(sql, my_data, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    });


};

exports.get_all = function (done) {
    let sql = 'SELECT name, id, thumbnail,tagLabel FROM 3DModels ORDER BY id DESC;';
    db.get().query(sql, function (err, result) {
       if(err){
           return done(err);
       } else {
           return done(null, result);
       }
    });
};


exports.get_single_3dmodel = function (id, done) {
    let sql = 'SELECT * FROM 3DModels WHERE id = ?;';
    db.get().query(sql, id, function (err, result) {
        if (err) {
            return done(err);
        } else {
            return done(null, result);
        }
    });
};

exports.update_thumbnail_url = function (id, thumbnail, done) {
    let sql = 'UPDATE 3DModels SET thumbnail = ? WHERE id = ?;';
    let my_data = [thumbnail, id];
    db.put().query(sql, my_data, function (err, result) {
        if (err) {
            return done(err);
        } else {
            return done (null, 'success');
        }
    });
};

exports.delete_single_3dmodel = function (id, done) {
    let sql1 = 'SELECT url, thumbnail FROM 3DModels WHERE id = ?;';
    let sql2 = 'DELETE FROM 3DModels WHERE id = ?;';
    db.get().query(sql1, id, function (err1, result1) {
        if(err1){
            return done(err1);
        } else{
            let url = result1[0].url;
            let thumbnail = result1[0].thumbnail;
            try{
                fs.unlinkSync(url);
            }catch (err){
                console.log(err.message);
                console.log(url+" cannot be deleted!");
            }
            try{
                fs.unlinkSync(thumbnail);
            }catch (err){
                console.log(err.message);
                console.log(thumbnail+"cannot be deleted!");
            }
            db.delete().query(sql2, id, function (err2, result2) {
                if (err2) {
                    return done(err2);
                } else {
                    return done(null, 'success');
                }
            });
        }
    });

};

// exports.update_display = function (id, auto_display, done) {
//     let sql = "UPDATE 3DModels SET autoDisplay = ? WHERE id=?;";
//     let my_data = [auto_display, id];
//     db.put().query(sql, my_data, function (err, result) {
//         if(err){
//             return done(err);
//         }else{
//             return done(null, 'success');
//         }
//     })
// };


exports.add_tag_label = function (tag_label, id, done) {
    let sql1 = 'SELECT tagLabel FROM 3DModels WHERE id = ?;';
    let sql2 = 'UPDATE 3DModels SET tagLabel = ? WHERE id = ?;';
    db.get().query(sql1, id, function (err1, result1) {
        if(err1){
            console.log(err1);
        } else {
            let new_tag_label = '';
            if(result1[0].tagLabel==null){
                new_tag_label=','+tag_label+',';
            }else{
                new_tag_label = result1[0].tagLabel+','+tag_label+',';

            }
            let my_data = [new_tag_label, id];
            db.put().query(sql2, my_data, function (err2, result2) {
                if(err2){
                    return done(err2);
                }else{
                    return done(null, result2);
                }
            });
        }
    });
};

exports.delete_tag_label = function (tag_label, id, done) {
    let sql1 = 'SELECT tagLabel FROM 3DModels WHERE id = ?;';
    let sql2 = 'UPDATE 3DModels SET tagLabel = ? WHERE id = ?;';
    db.get().query(sql1, id, function (err, result1) {
        let new_tag_label = result1[0].tagLabel.replace(','+tag_label+',', '');
        let my_data = [new_tag_label, id];
        db.put().query(sql2, my_data, function (err2, result2) {
            if(err){
                return done(err2);
            }else{
                return done(null, result2);
            }
        });
    });
};

exports.get_all_tags = function (id, done) {
    let sql = 'SELECT tagLabel FROM 3DModels WHERE id = ?;';
    db.get().query(sql, id, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    });
};

exports.get_models_by_tag = function (tag_label, done) {
    let sql = 'SELECT id FROM 3DModels WHERE tagLabel LIKE ?;';
    db.get().query(sql, '%,'+tag_label+',%', function (err, result) {
        if(err){
            return done(err);
        } else {
            return done(null, result);
        }
    });
};

exports.get_all_tagnames = function (done) {
    let sql = 'SELECT tagLabel FROM 3DModels;';
    db.get().query(sql, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    })
}

