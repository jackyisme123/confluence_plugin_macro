var my_message = '';
var model_url = '';
var height = '';
var width = '';
var auto_display = '';
var save_page_url = '';
var domain = 'https://cce.forge.wetaworkshop.co.nz';
// var domain = 'http://localhost:8080';

//bind on initialization of editor
AJS.bind("init.rte", function() {
    var macroName = '3D Model';

    // 1. create dialog to add macro
    var dialog = new AJS.Dialog({
        width: 820,
        height: 860,
        id: "test-dialog",
        closeOnOutsideClick: true
    });

    dialog.addHeader("3D Model");

    // hide dialog
    dialog.addCancel("Cancel", function() {
        dialog.hide();
        document.getElementById('test_frame').src = domain+ "/3dmodels";
    });

    // add panel
        dialog.addPanel("test","<iframe id = 'test_frame' src ='"+domain+"/3dmodels' height='700' width='780' frameborder='0' scrolling='no' >Browser not compatible.</iframe>\n","my-macro-test");

    function receiveMessage(event)
    {
        if (event.origin !== domain){
            console.log('wrong origin');
        }
        else{
            my_message=event.data;
            var message_parts = my_message.split("@#$%^&*&^%$#@");
            model_url = message_parts[0];
            height = message_parts[1];
            width = message_parts[2];
            auto_display = message_parts[3];
            save_page_url = message_parts[4];
            var currentParams = {};
            currentParams["url"] = model_url;
            currentParams["height"]=height;
            currentParams["width"]=width;
            currentParams["auto_display"] = auto_display;
            currentParams["page_url"] = save_page_url;
            // 3. get current selection in editor
            var selection = AJS.Rte.getEditor().selection.getNode();
            var macro = {
                name: macroName,
                params: currentParams,
                defaultParameterValue: "",
                body : ""
            };
            // 4. convert macro and insert in DOM
            tinymce.plugins.Autoconvert.convertMacroToDom(macro, function(data, textStatus, jqXHR ) {
                AJS.$(selection).html(data);
            }, function(jqXHR, textStatus, errorThrown ) {
                AJS.log("error converting macro to DOM");
            });

            dialog.hide();
            document.getElementById('test_frame').src = domain+ "/3dmodels";
        }

    }



    // add event listener (when receive message from frontend, execute receiveMessage function)
    window.addEventListener("message", receiveMessage, false);

    // 5. bind event to open macro browser
    AJS.MacroBrowser.setMacroJsOverride(macroName, {opener: function(macro) {
        if('params' in macro){
            var currentParams = {};
            currentParams["url"] = macro.params['url'];
            currentParams["height"] = macro.params['height'];
            currentParams["width"] = macro.params['width'];
            currentParams["auto_display"] = macro.params['auto_display'];
            if(macro.params['page_url'].indexOf("?")!=-1){
                currentParams["page_url"] = macro.params['page_url'].substring(0, macro.params['page_url'].indexOf("?"));
            }else{
                currentParams["page_url"] = macro.params['page_url'];
            }
            document.getElementById('test_frame').src = currentParams['page_url']+"?height="+currentParams['height']+"&width="+currentParams['width']+"&auto_display="+currentParams['auto_display'];
        }
        // open custom dialog
        dialog.show();
        // empty params when use macro browser
        /* ***Important***
        ****************************************************************************************
        *** If lose this statement, you cannot pass your argument modification to JAVA file. ***
        ****************************************************************************************
         */
        tinymce.confluence.macrobrowser.macroBrowserComplete({name: macroName, "bodyHtml": undefined, "params": currentParams});
        // This will successfully queue a message to be sent to the popup, assuming
        // the window hasn't changed its location.

    }});
});


