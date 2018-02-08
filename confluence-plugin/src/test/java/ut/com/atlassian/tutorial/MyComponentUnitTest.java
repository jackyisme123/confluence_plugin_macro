package ut.com.atlassian.tutorial;

import org.junit.Test;
import com.wetaworkshop.api.MyPluginComponent;
import com.wetaworkshop.impl.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}