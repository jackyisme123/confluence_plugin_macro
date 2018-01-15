<template>
  <div class="3d_model_div">Refresh Browser</div>
</template>


<script>
  export default {
    data() {
      return {
        my_id: this.$route.params.id
      }
    },
    mounted: function () {
      this.show_model_by_id();
    },
    methods: {
      show_model_by_id () {
        let my_url = '';
        let auto_display = true;
        this.$http.get('http://localhost:4941/confluence_api/v1/3dmodels/' + this.my_id).then(function (result) {
          for(let body_part of result.body) {
            my_url = body_part.url;
            if(body_part.autoDisplay==0){
              auto_display=false;
            }
          }
          var params = {fullFrame: true, autoStart: true, autoStart: auto_display};
          var myviewer = marmoset.embed('http://localhost:4941/confluence_api/v1/3dmodels/'+my_url, params);

        });
      }
    }
  }

</script>
