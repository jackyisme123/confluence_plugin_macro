<!-- show model detail -->
<template>
  <div>
    <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
      <div class="container-fluid">
        <!--<div class="navbar-header">-->
        <!--<a class="navbar-brand" href="#">Confluence Marco Extension</a>-->
        <!--</div>-->
        <ul class="nav navbar-nav">
          <li class="nav-item"><router-link :to="{path: '/3dmodels'}"><span class="fa fa-cube fa-lg" aria-hidden="true"></span> 3D</router-link></li>
          <!--<li class="nav-item"><router-link :to="{path: '/videos'}"><span class="fa fa-video-camera fa-lg" aria-hidden="true"></span> Video</router-link></li>-->
        </ul>
      </div>
    </nav>

    <div class="row">
      <div class="col-sm-9" style="padding-left: 45px;">
        <h3 class="col-sm-4">{{model.name}}</h3>
        <br>
        <div class="pull-right" style="margin-top: 32px">
        <a data-toggle="modal" data-target="#deleteAllVersionsModal">
          <div class="label label-danger" style="font-size: small;" >DELETE</div>
        </a>
          <div class="label label-warning" style="font-size: small; font-family: 'Times New Roman'; margin-left: 10px" ><router-link :to="{path: '/3dmodels/detail/'+model.name+'/version'}"><i class="fa fa-code-fork"></i> · v{{model.version}}</router-link></div>
        </div>
        <!--<h5 class="col-sm-5">Upload Date: {{new Date(model.creationDate).toLocaleDateString()}}</h5>-->
        <iframe :src="'/3dmodels/detail/'+my_id+'/model'" height="500" width="538" frameBorder="0" style="padding-top: 5px" id="my_3d_model_iframe"></iframe>
        <div class="pull-right" style=" padding-top: 1px">
          <h5>
            <a data-toggle="modal" data-target="#tagModal">
              <span class="fa fa-tags" style="color: #337ab7"></span>
            </a>
            <span class="label label-primary" v-for="tag in all_tags" style="margin-left: 5px" @click="click_tag(tag)">{{tag}}</span>
            <a data-toggle="modal" data-target="#tagModal">
              <span class="label label-defalut" style="color: #337ab7; font-size: 12px;" v-if="all_tags.length==0">Add a tag?</span>
            </a>
          </h5>
        </div>
      </div>
      <div class="col-sm-3" style="padding-right: 45px;">
        <form>
          <div class="row" >
            <div class="form-group col-sm-12" style="padding-top: 70%">
              <label for="height" class="label-sm" style="font-size: 12px">Height: <span v-if="height!=''">{{parseInt(height)}}</span></label>
              <input type="text" class="form-control input-sm" id="height" placeholder="100~1000" v-model="height">
            </div>
            <div class="form-group col-sm-12" style="padding-top: 10%">
              <label for="width" class="label-sm" style="font-size: 12px">Width: <span v-if="height!=''">{{parseInt(width)}}</span></label>
              <input type="text" class="form-control input-sm" id="width" placeholder="100~1000" v-model="width">
            </div>
          </div>
          <div class="form-group" style="padding-top: 10%">
            <div class="row">
              <div class="checkbox col-sm-12">
                <label>
                  <input type="checkbox" id="auto_display"> Auto Display
                </label>
                <div style="padding-top: 20%;">
                <label style="color:red" v-if="!height_check && !width_check">Both height and width range must be from 100 to 1000</label>
                <label style="color:red" v-else-if="!height_check">Height range must be from 100 to 1000</label>
                <label style="color:red" v-else-if="!width_check">Width range must be from 100 to 1000</label>
                <label v-else=""></label>
                </div>
              </div>
              <br><br><br><br><br><br>
            </div>
          </div>
        </form>
        <div class="col-sm-12 bottom-right" >
          <button type="button" class="btn btn-success btn-sm pull-right" id="use_button" @click="choose_model">&nbspSubmit&nbsp</button>
        </div>
      </div>
    </div>

    <div id="tagModal" class="modal fade" role="dialog">
      <div class="modal-dialog modal-lg" role="content">
        <div class="modal-content">
          <div class="model-header">
            <h1>&nbsp&nbspTags</h1>
            <hr>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-sm-1"></div>
              <div class="col-sm-5">
                <input type="text" class="form-control" id="tag_input" v-model="tag_input" list="tags"/>
                <datalist id="tags" v-if="tag_input!=''">
                  <option v-for="tag in all_tag_names">{{tag}}</option>
                </datalist>
              </div>
              <div class="offset-1 col-sm-2">
                <button type="button" class="btn btn-primary" @click="add_tag">Add</button>
              </div>
              <div class="offset-1 col-sm" style="color:red"><h5>{{tag_err}}</h5></div>
            </div>
            <div class="row">
              <h5 style="padding-left: 64px"><label class="label label-warning" v-for="tag in all_tags" style="margin-right: 5px" ><a @click="click_tag(tag)"><span>{{tag}}</span></a><span>&nbsp&nbsp</span><a @click="delete_tag(tag)"><span>×</span></a></label></h5>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-sm" @click="cancel_tag_modal">Done</button>
          </div>
        </div>
      </div>
    </div>
    <div id="deleteAllVersionsModal" class="modal fade" role="dialog">
      <div class="modal-dialog modal-sm" role="content">
        <div class="modal-content">
          <div class="modal-body">
            <h5>Would you like to remove all versions of {{model.name}}</h5>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default btn-sm" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger btn-sm" @click="delete_all_versions" data-dismiss="modal">Delete</button>
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
        my_id: this.$route.params.id,
        model: '',
        height: 300,
        width: 300,
        height_check: true,
        width_check:true,
        gap_sign: "@#$%^&*&^%$#@",
        all_tags: [],
        tag_err: '',
        tag_input:'',
        all_tag_names: [],
        //for security concern use destination origin instead of '*'
        confluence_url: '*'
      }
    },
    mounted: function () {
      this.get_model_detail();
      this.get_all_tags();
      this.get_all_tag_names();
    },
    methods: {
      get_model_detail(){
        if(this.$route.query.height){
          this.height = this.$route.query.height;
        }
        if(this.$route.query.width){
          this.width = this.$route.query.width;
        }
        if(this.$route.query.auto_display){
          document.getElementById('auto_display').checked = (this.$route.query.auto_display=='true');
        }
        this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/'+this.my_id).then(function (res) {
          if (!res.body[0]){
            this.$router.push({path: '/3dmodels'});
          }else{
            this.model = res.body[0];
          }
        });
      },
      get_all_tags(){
        this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/tags/'+this.my_id).then(function (res1) {
          for (let tag of res1.body){
            if(tag.tagLabel){
                let tags = tag.tagLabel.split(',');
                for(let tag1 of tags){
                  if(tag1&&tag1!=''){
                    this.all_tags.push(tag1);
                  }
                }
            }
          }
        });
      },
      choose_model() {
        this.height_check=true;
        this.width_check=true;
        let pass_url = process_env.server_url+'/confluence_api/v1/3dmodels/'+this.model.url;
        // check height or width is valid or not
        let height = parseInt(this.height);
        let width = parseInt(this.width);
        if(!(height>=100 && height<=1000)){
          this.height_check=false;
        }
        if(!(width>=100 && width<=1000)){
          this.width_check=false;
        }
        if(!(this.height_check&&this.width_check)){
          return;
        }
        let auto_display = document.getElementById('auto_display').checked;
          let msg = pass_url+this.gap_sign+height+this.gap_sign+width+this.gap_sign+auto_display+this.gap_sign+window.location.href;
          parent.postMessage(msg, this.confluence_url);
          $('#useModal').modal('hide');
      },

      add_tag() {
        let tag = this.tag_input;
        if(tag==''){
          this.tag_err = 'Tag cannot be empty!';
        }else if(this.all_tags.indexOf(tag) != -1){
          this.tag_err = 'Tag already exists!';
        }else if(tag.indexOf(',')!=-1){
          this.tag_err = 'Cannot use ","';
        }else{
          this.$http.post(process_env.server_url+'/confluence_api/v1/3dmodels/tags/'+this.my_id, {
            "tag_label": tag
          }).then(function (result) {
            this.all_tags.push(tag);
            this.tag_input='';
            this.tag_err = '';
          });
        }
      },
      cancel_tag_modal(){
        this.tag_input='';
        this.tag_err = '';
        $('#tagModal').modal('hide');
      },
      delete_tag(del_tag){
        this.$http.delete(process_env.server_url+'/confluence_api/v1/3dmodels/tags/'+this.my_id+'/tag/' +del_tag).then(function (result) {
            this.all_tags.splice(this.all_tags.indexOf(del_tag), 1);
        });
      },
      get_all_tag_names(){
        this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/tags/tag_name/all').then(function (result) {
          for(let tagname of result.body){
            this.all_tag_names.push(tagname);
          }
        });
      },
      click_tag(tag){
        $('#tagModal').modal('hide');
        this.$router.push({path: '/3dmodels?select_tag='+tag});
      },
      delete_all_versions(){
        this.$http.delete(process_env.server_url+'/confluence_api/v1/3dmodels/versions/'+this.model.name).then(function (result) {
          this.$router.push({path: '/3dmodels'});
        });
      }

    }
  }

</script>
