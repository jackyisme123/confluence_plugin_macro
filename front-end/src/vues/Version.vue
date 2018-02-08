<!-- show version detail -->
<template>
  <div id="version">
    <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
      <div class="container-fluid">
        <ul class="nav navbar-nav">
          <li class="nav-item"><router-link :to="{path: '/3dmodels'}"><span class="fa fa-cube fa-lg" aria-hidden="true"></span> 3D</router-link></li>
        </ul>
      </div>
    </nav>
    <body>
      <div class="container">
        <div class="row">
          <div class="col-sm-12">
            <h3>{{my_file_name}}</h3>
            <h4><div class="label label-warning">Version Control</div></h4>
          </div>
        </div>
        <div class="row">
          <div class="btn btn-primary btn-sm pull-right col-sm-1" style="margin-right: 80px; font-weight: bold" type="button" @click="last_page">Close</div>
        </div>
        <br>
        <br>
        <div class="row">
          <div class="table-hover table-responsive">
            <table class="table text-center">
              <thead class="thead-inverse">
                <tr class="row">
                  <th class="text-center offset-sm-1 col-sm-1">#</th>
                  <th class="text-center offset-sm-1 col-sm-2">Version#</th>
                  <th class="text-center col-sm-2">Create Date</th>
                  <th class="text-center col-sm-3">Comment</th>
                  <th class="text-center col-sm-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="row" v-for="(model, index) in page_versions" style="height: 60px">
                  <td class="text-center offset-sm-1 col-sm-1" style="vertical-align: middle !important;text-align: center;">{{index+1}}</td>
                  <td class="text-center offset-sm-1 col-sm-2" style="vertical-align: middle !important;text-align: center;" v-if="model.id == current_version.id"><div class="label label-warning" style="font-size: small">v{{model.version}}</div></td>
                  <td class="text-center offset-sm-1 col-sm-2" style="vertical-align: middle !important;text-align: center;" v-else="">v{{model.version}}</td>
                  <td class="text-center col-sm-2" style="vertical-align: middle !important;text-align: center;">{{new Date(model.creationDate).toLocaleDateString()}}</td>
                  <td class="text-center col-sm-3" style="vertical-align: middle !important;text-align: center;" >
                    <a href="#" data-toggle="tooltip" :title="model.versionComment" @mouseover="tooltip"> {{model.sub_version_comment}} </a>
                    <a data-toggle="modal" data-target="#commentModal" @click="show_comment(model)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a></td>
                  <td class="text-center col-sm-2" style="vertical-align: middle !important;text-align: center;">
                    <span v-if="!model.isCurrentVersion"><span class="label label-success" style="font-size: x-small" ><a style="color:white" @click="use_version(model)">USE</a></span>&nbsp&nbsp&nbsp</span>
                    <span class="label label-danger" style="font-size: x-small" ><a data-toggle="modal" data-target="#deleteModal" style="color:white" @click="change_delete_modal_content(model)">DEL</a></span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
              <div style="position: absolute; bottom: 50px; width: 768px; padding-left: 30px;">
                <div v-if="total_num!=0" style=" text-align:center;">
                  <ul class="pagination pagination-sm">
                    <li><a href="#" @click="backward()">&laquo;</a></li>
                    <li v-for="n in total_num"><a @click="go_page(n)">
                      <span v-if="page_num==n">{{n}}</span>
                      <span v-else="">{{n}}</span>
                    </a></li>
                    <li><a href="#"@click="forward()">&raquo;</a></li>
                  </ul>
                </div>
              </div>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </body>
    <div id="deleteModal" class="modal fade" role="dialog">
      <div class="modal-dialog modal-md" role="content">
        <div class="modal-content">
          <div class="modal-header">
            <h4>Version Control</h4>
          </div>
          <div class="modal-body">
            <h5>{{delete_modal_content}}</h5>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger btn-sm" @click="delete_model" data-dismiss="modal">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div id="commentModal" class="modal fade" role="dialog">
      <div class="modal-dialog modal-md" role="content">
        <div class="modal-content">
          <div class="modal-header">
            <h4>Modify Comment</h4>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="comment">New Comment:</label>
              <textarea class="form-control" rows="5" id="comment" placeholder="Add your comment here" v-model="my_comment" maxlength="345" type="resize: none;"></textarea>
              <div class="pull-right"><h6>{{max_char - my_comment.length}} remaining</h6></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success btn-sm" @click="modify_comment" data-dismiss="modal">Confirm</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        my_file_name: this.$route.params.name,
        all_versions: [],
        page_num:1,
        per_page:5,
        total_num:0,
        page_versions: [],
        current_version: null,
        delete_modal_content: '',
        deleting_model: null,
        my_comment: '',
        comment_model: null,
        max_char: 345
      }
    },
    mounted: function () {
      this.get_model_detail();
    },
    methods: {
      get_model_detail(){
          this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/versions/'+this.my_file_name).then(function (res2) {
            this.all_versions = res2.body;
            for(let version of this.all_versions){
              if(version.isCurrentVersion){
                this.current_version = version;
              }
              let sub_version_comment = '';
              if(version.versionComment){
                if(version.versionComment.length>10){
                  sub_version_comment = version.versionComment.substring(0, 10)+"...";
                  let temp_name = '';
                  //maximum name shown length is 20
                  for(let i=0; i*20<version.versionComment.length;i++){
                    temp_name += version.versionComment.slice(i*20, (i+1)*20)+'\n';
                  }
                  version.versionComment = temp_name;
                }else{
                  sub_version_comment = version.versionComment;
                }
              }
              version['sub_version_comment'] = sub_version_comment;
            }
            this.total_num=Math.ceil(this.all_versions.length/this.per_page);
            this.page_versions=[];
            for(let i in this.all_versions){
              if(i>=this.per_page*(this.page_num-1)&&i<=this.per_page*(this.page_num-1)+this.per_page-1) {
                this.page_versions.push(this.all_versions[i]);
              }
            }
          });
      },
      tooltip (){
        $('[data-toggle="tooltip"]').tooltip();
      },
      go_page(pn){
        this.page_num=pn;
        this.get_model_detail();
      },
      forward(){
        if(this.page_num<this.total_num){
          this.page_num+=1;
          this.get_model_detail();
        }
      },
      backward(){
        if(this.page_num>1){
          this.page_num-=1;
          this.get_model_detail();
        }
      },
      last_page(){
        this.$router.push({path: '/3dmodels/detail/'+this.current_version.id});
      },
      use_version(my_model){
        let current_version_id = this.current_version.id;
        let new_version_id = my_model.id;
        this.$http.put(process_env.server_url+"/confluence_api/v1/3dmodels/versions",
          {
            "old_version_id": current_version_id,
            "new_version_id": new_version_id
          }).then(function (res) {
          this.$router.push({path: '/3dmodels/detail/'+new_version_id});
        });
      },
      change_delete_modal_content(my_model){
        if(this.all_versions.length == 1){
          this.delete_modal_content = "This is last version of "+my_model.name+". Are you sure that you want to delete it?";
        } else if(this.current_version.id == my_model.id){
          this.delete_modal_content = "v"+this.current_version.version+" is the currently used version of "+this.current_version.name+". If deleted, current version will be replaced by latest one. Are you sure that you want to delete it?";
        }else{
          this.delete_modal_content = "Do you want to delete v"+this.current_version.version+" of "+this.current_version.name+" ?";
        }
        this.deleting_model = my_model;
      },
      delete_model(){
        if(this.current_version.id == this.deleting_model.id && this.all_versions.length!=1){
          this.$http.delete(process_env.server_url+"/confluence_api/v1/3dmodels/versions/"+this.deleting_model.id+"/name/"+this.deleting_model.name).then(function (result1) {
            this.get_model_detail();
          });
        }else{
          this.$http.delete(process_env.server_url+"/confluence_api/v1/3dmodels/versions/"+this.deleting_model.id+"/name/zero").then(function (result2) {
            if(this.all_versions.length == 1){
              this.$router.push({path: '/3dmodels'});
            }else{
              this.get_model_detail();
            }
          });
        }

      },
      modify_comment(){
        this.$http.put(process_env.server_url+"/confluence_api/v1/3dmodels/versions/comment/"+this.comment_model.id,
          {
            "comment": this.my_comment
          }).then(function (result) {
            this.get_model_detail();
        });
      },
      show_comment(model){
        this.comment_model = model;
        this.my_comment = model.versionComment;
      }

    }
  }

</script>
