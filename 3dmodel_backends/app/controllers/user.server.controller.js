const user = require('../models/user.server.models.js');
const formidable = require('formidable');
const fs = require('fs');

exports.create_single_3dmodel = function (req, res) {
    let my_id ='';
    let fileURL = '';
    let form = new formidable.IncomingForm();
    let file_name = '';
    let temp_path='';
    form.parse(req);
    form.on('end',function (fields, files) {
        /* Temporary location of our uploaded file */
        file_name = this.openedFiles[0].name;
        fileURL = './uploads/' + file_name;
        if (file_name.toLowerCase().indexOf(".mview")!=-1) {
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


exports.get_all_3dmodels = function (req, res) {
    user.get_all(function (err, result) {
       if(err){
           console.log(err);
       }else{
           res.status(200).json(result);
       }
    });
};

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

// exports.update_3dmodel = function (req, res) {
//     let id = req.params.id;
//     let description = req.body.description;
//     let thumbnail = req.body.thumbnail;
//     user.update_single_3dmodel(id, thumbnail, description, function (err, result) {
//        if(err){
//            if (err.errno == '1062'){
//                console.log('name has been existed');
//            } else {
//                console.log(err);
//            }
//
//        } else {
//            res.status(200).send(result);
//        }
//     });
// };

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

// exports.auto_display =function (req, res) {
//     let auto_display = req.params.bool;
//     let id = req.params.id;
//     user.update_display(id, auto_display, function (err, result) {
//         if(err){
//             console.log(err);
//         }else{
//             res.status(200).send('success');
//         }
//     })
// };

exports.get_all_tags_by_id = function (req, res) {
    let id = req.params.id;
    user.get_all_tags(id, function (err, result) {
        if(err){
            console.log(err);
        }else{
            // let tags = [];
            // console.log(result);
            // if(result[0]!=undefined&&result[0].tagLabel!=null){
            //     let temps = result[0].tagLabel.split(',');
            //     for (let tag of temps) {
            //         if (tag != ''&&tag != 'null'){
            //             tags.push(tag);
            //         }
            //     }
            // }
            // console.log(tags);
            res.status(200).json(result);
        }
    });
};

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
                       if(temp1!=''&&temp1!=null&&tags.indexOf(temp1)!==-1){
                           tags.push(tags);
                       }
                   }
                   }
               }
           }
           res.status(200).json(tags);
       }
    });
};