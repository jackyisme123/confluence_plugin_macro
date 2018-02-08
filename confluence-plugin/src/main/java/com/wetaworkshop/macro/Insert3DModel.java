package com.wetaworkshop.macro;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.macro.MacroExecutionException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class Insert3DModel implements Macro {
    public String execute(Map<String, String> map, String s, ConversionContext conversionContext) throws MacroExecutionException{

        String downloadURL =map.get("url");
        String height =map.get("height");
        String width = map.get("width");
        String autoDisplay = map.get("auto_display");
        String newURL = downloadURL.replace("/3dmodels/./uploads/", "/3dmodels/uploads/");
        URL url;
        String returnPart;
        HttpURLConnection con;

        try {
            url = new URL(newURL);
            con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("HEAD");
            con.setConnectTimeout(1000);
            con.setReadTimeout(1000);
            if (con.getResponseCode() == HttpURLConnection.HTTP_OK){
                con.disconnect();
                String returnPart1 = "<div class=\"div_div_div\"></div>\n" +
                        "<script type=\"text/javascript\" src=\"https://viewer.marmoset.co/main/marmoset.js\">\n" +
                        "</script>\n" +
                        "<script>\n" +
                        "var my_url = \"" + newURL + "\";\n" +
                        "var myviewer = new marmoset.WebViewer( " + height + ", " + width + ", my_url);\n";
                String returnPart2 = "var my_div_class = my_url;\n" +
                        "var div_element = document.getElementsByClassName(\"div_div_div\")[0];\n" +
                        "div_element.className = my_div_class;\n" +
                        "div_element.appendChild(myviewer.domRoot);\n" +
                        "</script>\n";

                if(autoDisplay.equals("true")) {
                    returnPart = returnPart1+ "myviewer.loadScene();\n" +returnPart2;
                }else{
                    returnPart = returnPart1+returnPart2;
                }
            }else{
                System.out.println("failure");
                returnPart =  "<h3 style=\"color:red\">Connection to server failed.</h3>\n";
            }
        }
        catch (Exception e) {
            if(e.getMessage().equals("Read timed out")){
                return "<h3 style=\"color:red\">File not found.</h3>\n";
            }else{
                return "<h3 style=\"color:red\">An error occurred: '"+e.getMessage()+"' can't show 3D model properly</h3>\n";
            }
        }

        return returnPart;

    }

    public BodyType getBodyType() { return BodyType.NONE; }
    public OutputType getOutputType() { return OutputType.BLOCK; }
}
