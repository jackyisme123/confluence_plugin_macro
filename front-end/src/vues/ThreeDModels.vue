<!-- Home Page -->
<template>
<div>
  <div id="versionModal" class="modal fade" role="dialog">
    <div class="modal-dialog modal-lg" role="content">
      <div class="modal-content">
        <div class="modal-header">
          <h2 style="font-weight: bolder; font-family: 'Times New Roman'; color: #ffcc00">WARNING:</h2>
        </div>
        <div class="modal-body">
          <h4 v-if="my_upload_file">  <span style="font-family: 'Times New Roman'; font-weight: bold; color: dodgerblue; font-size: x-large">{{my_upload_file.name}}</span> has already been existed. </h4>
          <h4>  If you'd like to create a new version,</h4>
          <h4>  please write down some comments and click confirm.</h4>
          <h4>  Otherwise, click cancel to quit.</h4>
          <input type="text" class="form-control input-lg" id="version_comment" placeholder="Your Comment (less than 345 characters)" maxlength="345" v-model="version_comment">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default btn-lg" data-dismiss="modal" @click="close_version_modal">Cancel</button>
          <button type="button" class="btn btn-success btn-lg" @click="create_new_version" data-dismiss="modal">Confirm</button>
        </div>
      </div>
    </div>
  </div>
  <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
    <div class="container-fluid">
      <ul class="nav navbar-nav">
        <li class="nav-item"><router-link :to="{path: '/3dmodels'}"><span class="fa fa-cube fa-lg" aria-hidden="true"></span> 3D</router-link></li>
        <!--<li class="nav-item"><router-link :to="{path: '/videos'}"><span class="fa fa-video-camera fa-lg" aria-hidden="true"></span> Video</router-link></li>-->
      </ul>
    </div>
  </nav>
  <div class="row">
    <div class="pull-left col-sm-3" style="padding-left: 30px">
      <label class="btn btn-primary btn-file">
        UPLOAD & VIEW<input id="upload_file" type="file" class="file" @change="handleFileChange" style="display: none;">
      </label>
    </div>
    <div class="col-sm-3" style="color: red"><h5>{{err_msg}}</h5></div>
  <div class="pull-right col-sm-4" style="background-color: rgb(255,255,255); padding-right:30px;">
    <div>
      <div class="main">
        <form class="search-box sbx-twitter">
          <div role="search" class="sbx-twitter__wrapper">
            <input type="search" name="search_name" placeholder="Enter file or tag name" class="sbx-twitter__input" id="search_input">
            <button type="button" class="sbx-twitter__submit" @click="search_models_func"><i class="fa fa-search" ></i></button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
  <hr>
    <div class="row" id="model_summary">
      <div class="col-sm-3 text-center" v-for="model in current_models" style="height: 250px; padding-top: 10px; padding-left: 20px;">
        <router-link :to="{path: '/3dmodels/detail/'+model.id}">
          <img :src="my_server_url+'/confluence_api/v1/3dmodels/'+model.thumbnail" height="150" width="150"/>
          <br><br>
          <p style="font-family: Arial; font-size: 14px"><a href="#" data-toggle="tooltip" :title="model.temp_name" @mouseover="tooltip" data-placement="bottom">{{model.sub_name}}</a></p>
        </router-link>
      </div>
    </div>
  <div style="position: absolute; bottom: 0; width: 768px; padding-left: 30px;">
  <div v-if="total_num!=0" style=" text-align:center;">
    <ul class="pagination pagination-sm">
      <li><a href="#" @click="backward()">&laquo;</a></li>
      <li v-for="page_num in total_num"><a @click="go_page(page_num)">{{page_num}}</a></li>
      <li><a href="#"@click="forward()">&raquo;</a></li>
    </ul>
  </div>
  </div>

</div>

</template>


<script>
  export default {
    data() {
      return {
        all_models: [],
        all_file_names: [],
        search_models: [],
        err_msg: '',
        page_num:1,
        per_page:8,
        total_num:0,
        current_models: [],
        all_tag_names: [],
        version_comment: '',
        my_upload_file: null,
        //process_env.server_url can be modified in webpack.config.js
        my_server_url: process_env.server_url
      }
    },
    mounted: function () {
      this.get_all_3d_models();
      this.get_all_tag_names();
    },
    methods: {
      handleFileChange(e){
        const self = this;
        this.err_msg = '';
        this.my_upload_file = document.getElementById("upload_file").files[0];
        let upload_file = this.my_upload_file;
        if (upload_file.name.toLowerCase().indexOf(".mview")==-1){
          this.err_msg = "Error: Invalid file type, only .mview files are supported.";
          return;
        }
        for (let model of this.all_models){
          // if model name exists, open version modal to add new version
          if(model.name == upload_file.name){
            $('#versionModal').modal('show');
            return;
          }
        }
        let formData = new FormData();
        formData.append("upload_file", upload_file, upload_file.name);
        this.$http.post(process_env.server_url+'/confluence_api/v1/3dmodels/', formData,
          {
            headers:
              {
                'Content-Type': 'multipart/form-data'
              }
          }
        ).then(function (result) {
          if (result.status = 200) {
            let url = result.body.url;
            let id = result.body.id.toString();
            let myLoadFunc = function (blob) {
              formData= new FormData();
              formData.append("thumbnail", blob, id+".jpg");
              self.$http.post(process_env.server_url+'/confluence_api/v1/3dmodels/update_thumbnail', formData,
                {
                  headers:
                    {
                      'Content-Type': 'multipart/form-data'
                    }
                }
              ).then(function (result1) {
                this.$router.push({path: '/3dmodels/detail/'+id});
              });
            };
            marmoset.fetchThumbnail(process_env.server_url+'/confluence_api/v1/3dmodels/'+url, myLoadFunc);
          }
        });

      },

    create_new_version(){
      const self = this;
      let formData = new FormData();
      formData.append("version_comment", this.version_comment);
      formData.append("upload_file", this.my_upload_file, this.my_upload_file.name);
      this.$http.post(process_env.server_url+'/confluence_api/v1/3dmodels/versions', formData,
        {
          headers:
            {
              'Content-Type': 'multipart/form-data'
            }
      }).then(function (result1) {
        if(result1.status = 200){
          let url = result1.body.url;
          let id = result1.body.id.toString();
          let myLoadFunc = function (blob) {
            formData= new FormData();
            formData.append("thumbnail", blob, id+".jpg");
            self.$http.post(process_env.server_url+'/confluence_api/v1/3dmodels/update_thumbnail', formData,
              {
                headers:
                  {
                    'Content-Type': 'multipart/form-data'
                  }
              }
            ).then(function (result2) {
              this.$router.push({path: '/3dmodels/detail/'+id});
            });
          };
          marmoset.fetchThumbnail(process_env.server_url+'/confluence_api/v1/3dmodels/'+url, myLoadFunc);
        }
      });
    },
      get_all_3d_models(){
        this.err_msg = '';
        let search_value = this.$route.query['search_name'];
        let select_tag = this.$route.query['select_tag'];
        let temp = [];
        let sub_name = '';

        this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/').then(function (res) {
          this.all_models = res.body;
          if(search_value!=undefined){
            for(let model of this.all_models){
              // search by file name or tag name
              if(model.name.toLowerCase().indexOf(search_value.toLowerCase())!=-1||(model.tagLabel&&model.tagLabel.toLowerCase().indexOf(search_value.toLowerCase())!=-1)){
                //Model name maximum length showed is 15, rest is shown by '...'
                if(model.name.length>15){
                  sub_name = model.name.slice(0, 15)+'...';
                  let temp_name = ''
                  for(let i=0; i*15<model.name.length;i++){
                    temp_name += model.name.slice(i*15, (i+1)*15)+'\n';
                  }
                  model['temp_name'] = temp_name;
                }else{
                  sub_name = model.name;
                  model['temp_name'] = model.name;
                }
                model['sub_name'] = sub_name;
                temp.push(model);
              }
            }
              this.all_models = temp;

            //pagination
              this.total_num=Math.ceil(this.all_models.length/this.per_page);
              this.current_models=[];
              for(let i in this.all_models){
                if(i>=this.per_page*(this.page_num-1)&&i<=this.per_page*(this.page_num-1)+this.per_page-1) {
                  this.current_models.push(this.all_models[i]);
                }
              }
            }
          //search by click tag
          else if(select_tag!=undefined){
            this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/tag_name/'+select_tag).then(function (res) {
                let model_ids = res.body;
                for(let id of model_ids){
                  for(let model of this.all_models){
                    if(id.id == model.id){
                      if(model.name.length>15){
                        sub_name = model.name.slice(0, 15)+'...';
                        let temp_name = ''
                        for(let i=0; i*15<model.name.length;i++){
                          temp_name += model.name.slice(i*15, (i+1)*15)+'\n';
                        }
                        model['temp_name'] = temp_name;
                      }else{
                        sub_name = model.name;
                        model['temp_name'] = model.name;
                      }
                      model['sub_name'] = sub_name;
                      temp.push(model);
                    }
                  }
                }
              this.all_models = temp;
              this.total_num=Math.ceil(this.all_models.length/this.per_page);
              this.current_models=[];
              for(let i in this.all_models){
                if(i>=this.per_page*(this.page_num-1)&&i<=this.per_page*(this.page_num-1)+this.per_page-1) {
                  this.current_models.push(this.all_models[i]);
                }
              }
            });
            //no search
          }else{
            for(let model of this.all_models){
              if(model.name.length>15){
                sub_name = model.name.slice(0, 15)+'...';
                let temp_name = ''
                for(let i=0; i*15<model.name.length;i++){
                  temp_name += model.name.slice(i*15, (i+1)*15)+'\n';
                }
                model['temp_name'] = temp_name;
              }else{
                sub_name = model.name;
                model['temp_name'] = model.name;
              }
              model['sub_name'] = sub_name;
            }
            this.total_num=Math.ceil(this.all_models.length/this.per_page);
            this.current_models=[];
            for(let i in this.all_models){
              if(i>=this.per_page*(this.page_num-1)&&i<=this.per_page*(this.page_num-1)+this.per_page-1) {
                this.current_models.push(this.all_models[i]);
              }
            }
          }

        });
      },
      search_models_func() {
        let search_value = document.getElementById("search_input").value;
        this.$router.push({path: '/3dmodels?search_name='+search_value});
        //must refresh page, or won't be shown properly
        this.$router.go();
      },
      go_page(pn){
        this.page_num=pn;
        this.get_all_3d_models();
      },
      forward(){
        if(this.page_num<this.total_num){
          this.page_num+=1;
          this.get_all_3d_models();
        }
      },
      backward(){
        if(this.page_num>1){
          this.page_num-=1;
          this.get_all_3d_models();
        }
      },
      get_all_tag_names(){
        this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/tags/tag_name/all').then(function (result) {
          for(let tagname of result.body){
            this.all_tag_names.push(tagname.tagName);
          }
        });
      },

      close_version_modal(){
              this.version_comment = '';
      },
      tooltip (){
        $('[data-toggle="tooltip"]').tooltip({

        });
      },

    }
  }

</script>
