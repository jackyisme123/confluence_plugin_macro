<template>
<div>
  <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="#">Confluence Marco Extension</a>
      </div>
      <ul class="nav navbar-nav">
        <li class="nav-item"><router-link :to="{path: '/3dmodels'}"><span class="fa fa-cube fa-lg" aria-hidden="true"></span> 3D</router-link></li>
        <li class="nav-item"><router-link :to="{path: '/videos'}"><span class="fa fa-video-camera fa-lg" aria-hidden="true"></span> Video</router-link></li>
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
      <div class="offset-1 col-sm-4 align-items-center text-center" v-for="model in current_models" style="height: 300px; padding-top: 40px; padding-left: 30px;">
        <router-link :to="{path: '/3dmodels/detail/'+model.id}">
          <img :src="'http://localhost:4941/confluence_api/v1/3dmodels/'+model.thumbnail" height="220" width="220"/>
          <br><br>
          <p style="font-family: Arial; font-size: 14px">{{model.name}}</p>
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
        all_models: null,
        all_file_names: [],
        search_models: [],
        err_msg: '',
        page_num:1,
        per_page:6,
        total_num:0,
        current_models: [],
        all_tag_names: []
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
        let upload_file = document.getElementById("upload_file").files[0];
        if (upload_file.name.toLowerCase().indexOf(".mview")==-1){
          this.err_msg = "Error: invalid file type";
          return;
        }
        for (let model of this.all_models){
          if(model.name == upload_file.name){
            this.err_msg = "Error: already existed";
            return;
          }
        }
        let formData = new FormData();
        formData.append("upload_file", upload_file, upload_file.name);
        let thumbnail_name = upload_file.name.substring(0, upload_file.name.lastIndexOf(".")) + ".jpg";
        this.$http.post('http://localhost:4941/confluence_api/v1/3dmodels/', formData,
          {
            headers:
              {
                'Content-Type': 'multipart/form-data'
              }
          }
        ).then(function (result) {
          if (result.status = 200) {
            let url = result.body.url;
            var id = result.body.id.toString();
            var myLoadFunc = function (blob) {
              let formData= new FormData();
              formData.append("thumbnail", blob, id+".jpg");
              self.$http.post('http://localhost:4941/confluence_api/v1/3dmodels/update_thumbnail', formData,
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
            marmoset.fetchThumbnail('http://localhost:4941/confluence_api/v1/3dmodels/'+url, myLoadFunc);
          }
        });

      },

      get_all_3d_models(){
        this.err_msg = '';
        let search_value = this.$route.query['search_name'];
        let select_tag = this.$route.query['select_tag'];
        let temp = [];

        this.$http.get('http://localhost:4941/confluence_api/v1/3dmodels/').then(function (res) {
          this.all_models = res.body;
          if(search_value!=undefined){
            for(let model of this.all_models){
              if(model.name.toLowerCase().indexOf(search_value.toLowerCase())!=-1||model.tagLabel.toLowerCase().indexOf(search_value.toLowerCase())!=-1){
                  temp.push(model);
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
            }


          else if(select_tag!=undefined){
            this.$http.get('http://localhost:4941/confluence_api/v1/3dmodels/tag_name/'+select_tag).then(function (res) {
                let model_ids = res.body;
                for(let id of model_ids){
                  for(let model of this.all_models){
                    if(id.id == model.id){
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
          }else{
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
        this.$http.get('http://localhost:4941/confluence_api/v1/3dmodels/tags/tag_name/all').then(function (result) {
          for(let tagname of result.body){
            this.all_tag_names.push(tagname.tagName);
          }
        });
      },
      search_model_by_tag(name){
        this.$http.get('http://localhost:4941/confluence_api/v1/3dmodels/tag_name/'+name).then(function (res) {
          let model_ids = res.body;
          let result = [];
          for(let id of model_ids){
            result.push(id.modelId);
          }
          return result;
        });
      },



    }
  }

</script>
