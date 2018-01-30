const user = require('../models/user.server.models.js');
const formidable = require('formidable');
const fs = require('fs');

/* create a new 3dmodel (not existed previous version */
exports.create_single_3dmodel = function (req, res) {
    let my_id ='';
    let fileURL = '';
    let form = new formidable.IncomingForm();
    let file_name = '';
    let version_name = '';
    let temp_path='';
    form.parse(req);
    form.on('end',function (fields, files) {
        /* Temporary location of our uploaded file */
        file_name = this.openedFiles[0].name;
        if (file_name.toLowerCase().indexOf(".mview")!=-1) {
            version_name = file_name.substring(0, file_name.lastIndexOf(".mview"))+"_v1.mview";
            fileURL = './uploads/' + version_name;
            temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            /* Location where we want to copy the uploaded file */
            fs.copyFile(temp_path, fileURL, function (err) {
                if (err) {
                    console.error(err);
                } else {
                        user.insert_3dmodel(file_name, fileURL, function (err, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                my_id = result['insertId'];
                                res.status(200).json({"id": my_id, "url": fileURL});
                            }
                        });

                }
            });
        }
    });
};

/* add new version of specific 3dmodel */
exports.add_new_version = function (req, res) {
    let file_name = '';
    let version_comment= '';
    let form = new formidable.IncomingForm();
    form.parse(req);
    form.on('field', function(name, value) {
        version_comment = value;
    });
    form.on('end', function (fields, files) {
        if(this.openedFiles) {
            file_name = this.openedFiles[0].name;
            if (file_name.toLowerCase().indexOf(".mview") != -1) {
                let temp_path = this.openedFiles[0].path;
                user.add_version(file_name, temp_path, version_comment, function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.status(200).json(result);
                    }
                });
            }
        }else{
            res.status(404).json("cannot find uploading file!");
        }
    });
};

/* store thumbnail url to database */
exports.update_thumbnail = function (req, res) {
    let form = new formidable.IncomingForm();
    form.parse(req);
    form.on('end', function (fields, files) {
        let file = this.openedFiles[0];
        let file_path = file.path;
        let file_name = file.name;
        let fileURL1 = './uploads/' + file_name;
        let id = file_name.replace(".jpg", "");
        fs.copyFile(file_path, fileURL1, function (err) {
            if (err) {
                console.log(err);
            } else {
                user.update_thumbnail_url(id, fileURL1, function (err, result) {
                    if(err){
                        console.log(err);
                    }else{
                        res.status(200).json("success");
                    }
                });
            }

        });
    });

};

/* get all 3dmodels */
exports.get_all_3dmodels = function (req, res) {
    user.get_all_current_version(function (err, result) {
       if(err){
           console.log(err);
       }else{
           res.status(200).json(result);
       }
    });
};

/* get 3dmodel detail */
exports.get_3dmodel_detail = function (req, res) {
    let id = req.params.id;
    user.get_single_3dmodel(id, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.status(200).json(result);
        }
    });
};

/* delete 3dmodel */
exports.delete_3dmodel = function (req, res) {
    let id = req.params.id;
    user.delete_single_3dmodel(id, function (err, result) {
        if(err){
            console.log(err);
        } else {
            res.status(200).send(result);
        }
    });
};

/* get file by file name*/
exports.get_file = function (req, res) {
    let file_name = req.params.file_name;
    fs.readFile('./uploads/'+file_name, function (err, data) {
        if(err){
            console.log(err);
        }else{
            res.status(200).send(data);
        }
    });
};

/* get all tags by 3dmodel id */
exports.get_all_tags_by_id = function (req, res) {
    let id = req.params.id;
    user.get_all_tags(id, function (err, result) {
        if(err){
            console.log(err);
        }else{
            res.status(200).json(result);
        }
    });
};

/* add a tag to specific 3dmodel */
exports.add_tag = function (req, res) {
    let tag_label = req.body.tag_label;
    let id = req.params.id;
    user.add_tag_label(tag_label, id, function (err, result) {
       if(err){
           console.log(err);
       } else {
           res.status(200).send(result);
       }
    });
};

/* delete tag from specific 3dmodel */
exports.delete_tag = function (req, res) {
    let tag_label = req.params.tag_name;
    let id = req.params.id;
    user.delete_tag_label(tag_label, id, function (err, result) {
        if(err){
            console.log(err);
        } else {
            res.status(200).send(result);
        }
    });
};

/* get all 3dmodels by tag name */
exports.get_by_tagname = function (req, res) {
    let tag_label = req.params.tag_name;
    user.get_models_by_tag(tag_label, function (err, result) {
        if(err){
            console.log(err);
        } else{
            res.status(200).json(result);
        }
    });
};

/* get all tag names from all 3dmodels */
exports.get_all_tag_names = function (req, res) {
    user.get_all_tagnames(function (err, result) {
       if(err){
           console.log(err);
       } else{
           let tags = [];
           let temps = result;
           if(temps!=undefined){
               for (let temp of temps){
                   if(temp.tagLabel!=null){
                   let temp1s = temp.tagLabel.split(',');
                   for (let temp1 of temp1s){
                       if(temp1&&tags.indexOf(temp1)==-1){
                           tags.push(temp1);
                       }
                   }
                   }
               }
           }
           res.status(200).json(tags);
       }
    });
};

/* get all versions from specific 3dmodel by name */
exports.get_all_version_by_name = function (req, res) {
    let file_name = req.params.name;
    user.get_all_versions(file_name, function (err, result) {
        if(err){
            console.log(err);
        }else{
            res.status(200).json(result);
        }
    });
};

/* update current version (version control) */
exports.update_current_version = function (req, res) {
    let old_version_id = req.body.old_version_id;
    let new_version_id = req.body.new_version_id;
    user.update_version(0, old_version_id, function (err1, result1) {
        if(err1){
            console.log(err1);
        }else{
            user.update_version(1, new_version_id, function (err2, result2) {
                if(err2){
                    console.log(err2);
                }else{
                    res.status(200).json("success");
                }
            });
        }
    });
};

/* delete version from specific 3dmodel */
exports.delete_version = function (req, res) {
    let delete_id = req.params.id;
    let name = req.params.name;
    user.remove_version_by_id(delete_id, function (err1, result1) {
        if(err1){
            console.log(err1);
        }else{
            if(name == "zero"){
                res.status(200).send("success");
            }else {
                user.get_latest_version(name, function (err2, result2) {
                    if(err2){
                        console.log(err2);
                    }else{
                        let new_version = result2[0];
                        console.log("new version id: "+new_version.id);
                        user.update_version(true, new_version.id, function (err3, result3) {
                            if(err3){
                                console.log(err3);
                            }else{
                                res.status(200).send("success");
                            }
                        });
                    }
                });
            }

        }
    });

};

/* update version comment */
exports.update_version_comment = function (req, res) {
    let id = req.params.id;
    let new_comment = req.body.comment;
    user.change_version_comment(id, new_comment, function (err, result) {
        if(err){
            console.log(err);
        }else{
            res.status(200).send("success");
        }
    });
};

/* delete model of all versions*/
exports.delete_all_versions_by_name = function (req, res) {
    let name = req.params.name;
    user.delete_all_versions(name, function (err, result) {
        if(err){
            console.log(err);
        }else{
            res.status(200).send("success");
        }
    });
};
