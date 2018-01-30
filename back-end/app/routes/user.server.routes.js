const user = require('../controllers/user.server.controller.js');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
        res.header("Access-Control-Expose-Headers", "Accept-Ranges, Content-Encoding, Content-Length, Content-Range");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        next();
    });

    app.route('/confluence_api/v1/3dmodels').post(user.create_single_3dmodel);
    app.route('/confluence_api/v1/3dmodels').get(user.get_all_3dmodels);
    app.route('/confluence_api/v1/3dmodels/:id').get(user.get_3dmodel_detail);
    app.route('/confluence_api/v1/3dmodels/:id').delete(user.delete_3dmodel);
    app.route('/confluence_api/v1/3dmodels/uploads/:file_name').get(user.get_file);
    app.route('/confluence_api/v1/3dmodels/update_thumbnail').post(user.update_thumbnail);
    app.route('/confluence_api/v1/3dmodels/tags/:id').get(user.get_all_tags_by_id);
    app.route('/confluence_api/v1/3dmodels/tags/:id').post(user.add_tag);
    app.route('/confluence_api/v1/3dmodels/tags/:id/tag/:tag_name').delete(user.delete_tag);
    app.route('/confluence_api/v1/3dmodels/tag_name/:tag_name').get(user.get_by_tagname);
    app.route('/confluence_api/v1/3dmodels/tags/tag_name/all').get(user.get_all_tag_names);
    app.route('/confluence_api/v1/3dmodels/versions').post(user.add_new_version);
    app.route('/confluence_api/v1/3dmodels/versions/:name').get(user.get_all_version_by_name);
    app.route('/confluence_api/v1/3dmodels/versions').put(user.update_current_version);
    app.route('/confluence_api/v1/3dmodels/versions/:id/name/:name').delete(user.delete_version);
    app.route('/confluence_api/v1/3dmodels/versions/comment/:id').put(user.update_version_comment);
    app.route('/confluence_api/v1/3dmodels/versions/:name').delete(user.delete_all_versions_by_name);


};