<template>
  <div id="thumbnail">
  </div>
</template>

<script>
  export default {
    data() {
      return {
        my_id: this.$route.params.id
      }
    },
    mounted: function () {
      this.show_thumbnail();
    },
    methods: {
      show_thumbnail() {
        let my_url = '';
        this.$http.get(process_env.server_url+'/confluence_api/v1/3dmodels/' + this.my_id).then(function (result) {
          for(let body_part of result.body) {
            my_url = body_part.url;
          }
          console.log(my_url);
          var myLoadFunc = function (image) {
            image.height=220;
            image.width=220;
            document.getElementById("thumbnail").appendChild(image);
          };
          marmoset.fetchThumbnail(process_env.server_url+'/confluence_api/v1/3dmodels/'+my_url, myLoadFunc);

        });
      }
    }
  }

</script>
