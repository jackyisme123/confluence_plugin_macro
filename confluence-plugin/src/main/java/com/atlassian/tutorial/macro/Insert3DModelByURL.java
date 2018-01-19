package com.atlassian.tutorial.macro;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.macro.MacroExecutionException;

import java.util.Map;

public class Insert3DModelByURL implements Macro {



    public String execute(Map<String, String> map, String s, ConversionContext conversionContext) throws MacroExecutionException{
        String height = map.get("height");
        String width = map.get("width");

        if (height == null) {
            height = "300";
        }
        if (width == null){
            width = "300";
        }

        String url = map.get("URL");


        return  "<div class=\"div_div_div\"></div>\n" +
                "<script type=\"text/javascript\" src=\"https://viewer.marmoset.co/main/marmoset.js\">\n"+
                "</script>\n"+
                "<script>\n"+
                "var my_url = \""+url+"\";\n" +
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
