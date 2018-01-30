const db = require('../../config/db.js');
const fs = require('fs');

/* new mview file (not existed previous version) to upload */
exports.insert_3dmodel= function(name, fileURL, done){
    let my_data = [name, fileURL];
    let sql = 'INSERT INTO 3DModels (name, url, version, isCurrentVersion, versionComment) VALUES (?,?,1,TRUE,"original");';
    db.post().query(sql, my_data, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    });
};

/* add new version from specific 3dmodel by name*/
exports.add_version = function (file_name, temp_path, version_comment, done) {
    let sql1 = 'SELECT id, version FROM 3DModels WHERE name = ? ORDER BY version DESC LIMIT 1';
    let sql1p = 'SELECT id FROM 3DModels WHERE name=? AND isCurrentVersion = TRUE';
    let sql2 = 'UPDATE 3DModels SET isCurrentVersion = FALSE WHERE id = ?;';
    let sql3 = 'INSERT INTO 3DModels (name, url, version, isCurrentVersion, versionComment) VALUES (?,?,?,TRUE,?);';
    db.get().query(sql1, file_name, function (err1, result1) {
        if(err1){
            return done(err1);
        }else{
            let last_version = result1[0].version;
            let current_version = parseInt(last_version)+1;
            let version_name = file_name.substring(0, file_name.lastIndexOf(".mview"))+"_v"+current_version.toString()+".mview";
            let fileURL = './uploads/' + version_name;
            fs.copyFile(temp_path, fileURL, function (err2) {
                if(err2){
                    return done(err2);
                }else{
                    db.get().query(sql1p, file_name, function (err5, result5) {
                        if(err5){
                            done(err5);
                        }else{
                            let used_id = result5[0].id;
                            db.put().query(sql2, used_id, function (err3, result3) {
                                if(err3){
                                    return done(err3);
                                }else{
                                    let my_data = [file_name, fileURL, current_version, version_comment];
                                    db.post().query(sql3, my_data, function (err4, result4) {
                                        if(err4){
                                            return done(err4);
                                        }else{
                                            let my_id = result4['insertId'];
                                            return done(null, {"id": my_id, "url": fileURL});
                                        }
                                    })
                                }
                            })
                        }
                    });

                }
            });
        }
    })
};

/* get 3dmodels by current version */
exports.get_all_current_version = function (done) {
    let sql = 'SELECT name, id, thumbnail, tagLabel, version FROM 3DModels WHERE isCurrentVersion = TRUE ORDER BY id DESC;';
    db.get().query(sql, function (err, result) {
       if(err){
           return done(err);
       } else {
           return done(null, result);
       }
    });
};

/* get 3dmodel by id */
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

/* store thumbnail url to database */
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

/* add tag for specific model by id*/
exports.add_tag_label = function (tag_label, id, done) {
    let sql1 = 'SELECT tagLabel FROM 3DModels WHERE id = ?;';
    let sql2 = 'UPDATE 3DModels SET tagLabel = ? WHERE id = ?;';
    db.get().query(sql1, id, function (err1, result1) {
        if(err1){
            done(err1);
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

/* delete tag from specific 3dmodel by id*/
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

/* get all tags from specific 3dmodel by id*/
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

/* get 3dmodels  */
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

/* get all tagnames from all 3dmodels */
exports.get_all_tagnames = function (done) {
    let sql = 'SELECT tagLabel FROM 3DModels;';
    db.get().query(sql, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    });
};

/* get all versions from specific 3dmodel by name */
exports.get_all_versions = function (file_name, done) {
    let sql = 'SELECT * FROM 3DModels WHERE name = ? ORDER BY version DESC;';
    db.get().query(sql, file_name, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    })
};

/* update current version status by id */
exports.update_version = function (value, version_id, done) {
    let sql = 'UPDATE 3DModels SET isCurrentVersion = ? WHERE id = ?;';
    let my_data = [value, version_id];
    db.put().query(sql, my_data, function (err1, result1) {
        if(err1){
            return done(err1);
        }else{
            return done(null, "success");
        }
    });
    
};

/* remove version by id*/
exports.remove_version_by_id = function (id, done) {
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
                console.log(err);
            }
            try{
                fs.unlinkSync(thumbnail);
            }catch (err){
                console.log(err);
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

/* get latest version from specific 3dmodel by name */
exports.get_latest_version = function (name, done) {
    let sql = "SELECT * FROM 3DModels WHERE name = ? ORDER BY version DESC LIMIT 1;";
    db.get().query(sql, name, function (err, result) {
        if(err){
            return done (err);
        }else{
            return done(null, result);
        }
    })

};

/* change comment from specific version by id*/
exports.change_version_comment = function (id, new_comment, done) {
    let sql = 'UPDATE 3DModels SET versionComment = ? WHERE id = ?;';
    let data = [new_comment, id];
    db.put().query(sql, data, function (err, result) {
        if(err){
            return done(err);
        }else{
            return done(null, result);
        }
    });
};

/* delete all versions of model */
exports.delete_all_versions = function (name ,done) {
    let sql1 = 'SELECT id, url, thumbnail FROM 3DModels WHERE name = ?;';
    let sql2 = 'DELETE FROM 3DModels WHERE name = ?;';
    db.get().query(sql1, name, function (err1, result1) {
        if(err1){
            return done(err1);
        }else{
            for (let result of result1){
                let url = result.url;
                let thumbnail = result.thumbnail;
                try{
                    fs.unlinkSync(url);
                }catch (err){
                    console.log(err);
                }
                try{
                    fs.unlinkSync(thumbnail);
                }catch (err){
                    console.log(err);
                }

            }
            db.delete().query(sql2, name, function (err2, result2) {
                if(err2) {
                    return done(err2);
                }else{
                    return done(null, result2);
                }
            });
        }
    })

};
