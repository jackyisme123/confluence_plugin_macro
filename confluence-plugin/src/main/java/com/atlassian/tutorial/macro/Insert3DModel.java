package com.atlassian.tutorial.macro;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.core.ContentEntityObject;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.macro.MacroExecutionException;
import com.atlassian.confluence.pages.Attachment;
import com.atlassian.confluence.renderer.PageContext;

import java.util.Map;

public class Insert3DModel implements Macro {



    public String execute(Map<String, String> map, String s, ConversionContext conversionContext) throws MacroExecutionException{
        String myAttachment =map.get("myAttachment");
        String height = map.get("height");
        String width = map.get("width");
        String downloadURL = "";
        PageContext pageContext = null;
        ContentEntityObject contentEntityObject=null;
        Attachment attachment = null;

        if (height == null) {
            height = "300";
        }
        if (width == null){
            width = "300";
        }
//        pageContext.getSpaceKey();
        contentEntityObject = conversionContext.getEntity();

            attachment = contentEntityObject.getAttachmentNamed(myAttachment);
        try{
            downloadURL = "http://ardbeg:1990/confluence"+ attachment.getDownloadPath();
        }
        catch (Exception e){
            return "If you wanna insert 3D model in comment area, please use Insert_3D_Model_By_URL instead, \n" +
                    "otherwise make sure the file already in attachments.";
        }

//        http://ardbeg:1990/confluence/download/attachments/786437/Green_GKR.mview?api=v2


//        String url = map.get("URL");


        return  "<div class=\"div_div_div\">"+downloadURL+"</div>\n" +
                "<script type=\"text/javascript\" src=\"https://viewer.marmoset.co/main/marmoset.js\">\n"+
                "</script>\n"+
                "<script>\n"+
                "var my_url = \""+downloadURL+"\";\n" +
                "var myviewer = new marmoset.WebViewer( "+height+", "+width+", my_url );\n"+
                "var my_div_class = my_url;\n"+
                "var div_element = document.getElementsByClassName(\"div_div_div\")[0];\n"+
                "div_element.className = my_div_class;\n"+
                "div_element.appendChild(myviewer.domRoot);\n"+
                "</script>\n";

    }

    public BodyType getBodyType() { return BodyType.NONE; }

    public OutputType getOutputType() { return OutputType.BLOCK; }
}
