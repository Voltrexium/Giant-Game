

/**
 * Game where you(as green circle) try to eat/consume the pink and blue circles, and avoid the 
 * other objects due to various reasons
 *
 * @author Enay Bhatnagar
 * @version 10/31/2019
 */
 
import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.util.*;
import javax.swing.JFrame;
import java.util.ArrayList;
import java.io.PrintWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.BufferedReader;
import java.io.FileReader;
import java.applet.Applet;
public class original extends JFrame
{
    static final int WIDTH = 1000;
    static final int HEIGHT = 1000;
    static int money2 = 0;
    static String input2 = "";
    static boolean revival = false;
    public static int eaten;
    class user
    {
       int x, y;
       int w, h;
       int dx, dy;
    }
    public static int level = 0;
    public static int points;
    public static int pointCheck;
    public static class enem
    {
        private int x, y;
        private boolean alive; 
        enem(int X, int Y, boolean Alive)
        {
            x = X;
            y = Y;
            alive = Alive;
        }
        
        public int getX()
        {
            return x; 
        }
        public int getY()
        {
            return y;
        }
        public boolean getAlive()
        {
            return alive;
        }
        
        public void setX(int X)
        {
            x = X;
        }
        public void setY(int Y)
        {
            y = Y;
        }
        public void setAlive(boolean Alive)
        {
            alive = Alive;
        }
    }
    KeyboardInput keyboard = new KeyboardInput(); // Keyboard polling 
    Canvas canvas;
    
    Vector< Point > circles = new Vector< Point >(); // Circles (+points)
    Vector< Point > circles2 = new Vector< Point >(); // Circles(+points)
    Vector< Point > rectangles = new Vector< Point >(); // rectangles(death)
    Vector< Point > curved = new Vector< Point >(); // curved squares(-points)
    Vector< Point > xyz = new Vector< Point >(); // to zero setters(-points)
    
    user me = new user();// my circle
    public static ArrayList<enem> xy = new ArrayList<enem>();//enemies position list
    
    
    public static Random rand = new Random(); // Used for random circle locations
    
    //blue circle location and activation
    int x1 = rand.nextInt( WIDTH - 25);
    int y1 = rand.nextInt( HEIGHT - 25);
    boolean alive0 = true;
    
    boolean gameover = false;
    
    boolean check = false;
    
    int eSpeed = 1;
      
    boolean victory = false;
    public original() 
    {
        
        
        setIgnoreRepaint( true );
        setDefaultCloseOperation( JFrame.EXIT_ON_CLOSE );
        canvas = new Canvas();
        canvas.setIgnoreRepaint( true ); 
        canvas.setSize( WIDTH, HEIGHT );
        add( canvas );
        pack();
        
        // for keyboard using
        addKeyListener( keyboard );
        canvas.addKeyListener( keyboard );
        
        me.x = me.y = WIDTH/2;
        me.dx = me.dy = 5;
        me.w = me.h = 25;
        level = 0;
    }
    
    public void run() throws InterruptedException, IOException
    {
      
        canvas.createBufferStrategy( 2 );
        BufferStrategy buffer = canvas.getBufferStrategy();
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        GraphicsDevice gd = ge.getDefaultScreenDevice();
        GraphicsConfiguration gc = gd.getDefaultConfiguration();
        BufferedImage image = gc.createCompatibleImage( WIDTH, HEIGHT );
        
        Graphics graphics = null;
        Graphics2D visuals = null;
        Color background = Color.BLACK;
        
        
        while(gameover == false ) {
          try {
              
            // use the keyboard
            keyboard.poll();
            if( keyboard.keyDownOnce( KeyEvent.VK_ESCAPE ) )
              inputForGame2.main(input2, money2, image); 
            
            // Clear the back buffer           
            visuals = image.createGraphics();
            visuals.setColor( background );
            visuals.fillRect( 0, 0, WIDTH, HEIGHT );
            
            // Draw help
            visuals.setColor(  Color.GREEN );
            visuals.drawString( "Try to get all the pink circles", 20, 20 );
            visuals.drawString( "Use the arrow keys or WASD to move the circle", 20, 32 );
            visuals.drawString( "Pink is great don't you think?", 20, 44 );
            visuals.drawString( "Blue is a Wa-ha-hoo!", 20, 56 );
            visuals.drawString( "White ain't a good sight", 20, 68 );
            visuals.drawString( "Red is dead!", 20, 80 );
            visuals.drawString( "Press ESC to exit", 20, 104 );
            visuals.drawString( input2, 20, 118 );
            visuals.drawString( "$" + money2, 20, 130 );
             
            if (level == 0) 
            {
                visuals.drawString("Level: " + (level + 1), 20, 140 );
            }
            else
            {
                visuals.drawString("Level: " + level, 20, 140 );
            }
            
            
            visuals.drawString("Points: " + points, 20, 152 );
            
            
            // move add circles
            processInput();
            
            // Draw random circles
            visuals.setColor( Color.MAGENTA );
            for( Point p : circles ) 
            {
              visuals.drawOval( p.x, p.y, 25, 25 );
            }
            visuals.setColor( Color.MAGENTA );
            for( Point p : circles2 ) 
            {
                visuals.drawOval( p.x, p.y, 25, 25 );
            }
            
            //draws mobs
            String enemy = "Enemy";
            for (int i = 0; i < xy.size(); i++)
            {
                visuals.setColor( Color.RED );
                visuals.drawString(enemy, xy.get(i).getX() - 6, xy.get(i).getY() );
                visuals.drawOval( xy.get(i).getX(), xy.get(i).getY(), 25, 25 );
            }
            
            
            visuals.setColor( Color.CYAN );
            if (alive0 == true)
            {
                visuals.drawOval( x1, y1, 25, 25 ); 
            }
            
            //draw curved
            visuals.setColor( Color.WHITE );
            for( Point p : curved ) {
              visuals.drawRoundRect( p.x, p.y, 25, 25, 15, 15 );
            }
            //draw rectangles
            visuals.setColor( Color.RED );
            for( Point p : rectangles ) {
              visuals.drawRect( p.x, p.y, 25, 25 );
            }
            
            //draw xyz AKA point reseters
            visuals.setColor( Color.WHITE);//Color.WHITE
            for( Point p : xyz) {
              visuals.drawRect( p.x, p.y, 25, 25 );
            }
            
            // Draw user
            String name = "Player";
            visuals.setColor(  Color.GREEN );
            visuals.drawOval( me.x, me.y, me.h, me.w);
            visuals.drawString(name, me.x - 5, me.y );
            
            if (gameover == true)
            {
                  visuals.setColor(  Color.GREEN );
                  visuals.drawString( "GAME OVER:", 475, 488 );   
                  if (victory == true)
                  {
                        visuals.drawString( "VICTORY IS", 475, 512 ); 
                        visuals.drawString( "  YOURS!  ", 475, 524 );
                  }
                  
            }
            
            graphics = buffer.getDrawGraphics();
            graphics.drawImage( image, 0, 0, null );
            if( !buffer.contentsLost() )
            {
              buffer.show();
            }
            Thread.sleep(10);
            
          } 
            finally 
          {
            if( graphics != null ) 
            {
               graphics.dispose();
            }
            if( visuals != null ) 
            {
               visuals.dispose();
            }
          }
          
        }
        money2 = level/2 + money2;
        BufferedReader br = new BufferedReader(new FileReader("money.txt"));
        int everything = 0;
        try 
        {
            StringBuilder sb = new StringBuilder();
            String line = br.readLine();
            while (line != null) 
            {
                sb.append(line);
                sb.append(System.lineSeparator());
                line = br.readLine();
            }
            if(sb.toString().indexOf("\"") > 0 && sb.toString().length() > 0)
            {
                String p = sb.toString().substring(sb.toString().indexOf("\""), sb.toString().length());
                everything = Integer.parseInt(p);
            }
        } 
        finally 
        {
            br.close();
        }
        
        FileWriter fileWriter = new FileWriter("money.txt");
        PrintWriter printWriter = new PrintWriter(fileWriter);
        printWriter.print((everything+money2)+"");
        printWriter.close();
        
        Thread.sleep(3000);
        String x = playAgain.main();
        if (x.equals("Y"))
        {
            original.main(input2,  money2*money2, 0, 0);
        }
        if (x.equals("N"))
        {
            inputForGame2.main(input2, money2*money2, image); 
        } 
        if (x.equals("R") && money2 >= 100)
        {
            money2 = money2 - 100;
            original.main(input2,  money2*money2, xy.size(), points);
        }
        inputForGame2.main(input2, money2, image);
    }
        
    protected void processInput() throws InterruptedException
    {
        
        int ranBluSpwn = rand.nextInt(10000);
        
        if (points > Math.pow(10, level))
        { 
            level++;
            ranBluSpwn = 1;
        }
        
        if (points > Math.pow(10, level)/2)
        { 
            ranBluSpwn = 1;
        }
        
        if (eaten == 5 && points < 1000)
        {
            xy.add(new enem (rand.nextInt( WIDTH - 100), rand.nextInt( HEIGHT - 100), true));
            eaten = 0;
        }
        if (eaten == 10 && points < 10000)
        {
            xy.add(new enem (rand.nextInt( WIDTH - 100), rand.nextInt( HEIGHT - 100), true));
            eaten = 0;
        }
        if (eaten == 20 && points < 100000)
        {
            xy.add(new enem (rand.nextInt( WIDTH - 100), rand.nextInt( HEIGHT - 100), true));
            eaten = 0;
        }
        
        if (ranBluSpwn == 1 && alive0 == false)
        {
            alive0 = true;
            x1 = rand.nextInt( WIDTH - 25);
            y1 = rand.nextInt( HEIGHT - 25);
            check = false;
        }
        if (me.x - x1 <= 10 && me.x - x1 >= -10 && me.y - y1 <= 10 && me.y - y1 >= -10 && check == false)
        {
                rectangles.clear();
                curved.clear();
                xyz.clear();
                
                alive0 = false;
                for (int i = 0; i < xy.size();i++)
                {
                    xy.get(i).setAlive(true);
                }
                for (int i = 0; i < xy.size();i++)
                {
                    if (me.x - 100 > 0)
                    {
                        xy.get(i).setX(rand.nextInt( me.x - 100));
                    }
                    else
                    {
                        xy.get(i).setX(WIDTH - rand.nextInt(200));
                    }
                    if (me.y - 100 > 0)
                    {
                        xy.get(i).setY(rand.nextInt( me.y - 100));
                    }
                    else 
                    {
                        xy.get(i).setY(HEIGHT - rand.nextInt(200));
                    }
                }
                points = points * 2; 
                check = true;
        }
        
       
        
        
        for (int i = 0; i < xy.size(); i++)
        {
            int px = xy.get(i).getX();
            int py = xy.get(i).getY();
            if (xy.get(i).getX() < me.x)
            {
                xy.get(i).setX(xy.get(i).getX() + eSpeed);   
            }
            if (xy.get(i).getX() > me.x)
            {
                xy.get(i).setX(xy.get(i).getX() - eSpeed);   
            }
            if (xy.get(i).getY() < me.y)
            {
                xy.get(i).setY(xy.get(i).getY() + eSpeed);   
            }
            if (xy.get(i).getY() > me.y)
            {
                xy.get(i).setY(xy.get(i).getY() - eSpeed);   
            }
        }
        
        int ranCirc = rand.nextInt(10);
        if (ranCirc == 1 && circles.size() < 25)
        {
            int x = rand.nextInt( WIDTH - 100);
            int y = rand.nextInt( HEIGHT - 100);
            circles.add( new Point( x, y ) );
        }
        
        int ranCirc2 = rand.nextInt(10);
        if (ranCirc2 == 1 && circles2.size() < 25)
        {
            int x = rand.nextInt( WIDTH - 100);
            int y = rand.nextInt( HEIGHT - 100);
            circles2.add( new Point( x, y) );
        }
        int ranRec = rand.nextInt(100);
        if (ranRec == 1 && rectangles.size() < 30)
        {
            int x = rand.nextInt( WIDTH - 25);
            int y = rand.nextInt( HEIGHT - 25);
            rectangles.add(new Point (x, y));
        }
        int ranCuv = rand.nextInt(100);
        if (ranCuv == 1 && curved.size() < 25)
        {
            int x = rand.nextInt( WIDTH - 25);
            int y = rand.nextInt( HEIGHT - 25);
            curved.add(new Point (x, y));
        }
        int ranWhite = rand.nextInt(500);
        if (ranWhite == 1 && xyz.size() < 15)
        {
            int x = rand.nextInt( WIDTH - 25);
            int y = rand.nextInt( HEIGHT - 25);
            xyz.add(new Point (x, y));
        }
        
        //circle blue
        if (x1 < me.x || x1 >= HEIGHT - 25)
        {
            x1--;   
        }
        if (x1 > me.x || x1 <= 0)
        {
            x1++;   
        }
        if (y1 < me.y || y1 >= WIDTH - 25)
        {
            y1--;   
        }
        if (y1 > me.y || y1 <= 0)
        {
            y1++;   
        }
        
        // If moving down
        if(input2 == "W")
        {
            if( keyboard.keyDown( KeyEvent.VK_DOWN ) || keyboard.keyDown( KeyEvent.VK_S )) 
            {
              me.y += me.dy;
              // Check collision with botton
              if( me.y + me.h > HEIGHT - 1 )
                me.y = HEIGHT - me.h - 1;
            }
            // If moving up
            if( keyboard.keyDown( KeyEvent.VK_UP ) || keyboard.keyDown( KeyEvent.VK_W )) 
            {
              me.y -= me.dy;
              // Check collision with top
              if( me.y < 0 )
                me.y = 0;
            }
            // If moving left
            if( keyboard.keyDown( KeyEvent.VK_LEFT ) || keyboard.keyDown( KeyEvent.VK_A )) 
            {
              me.x -= me.dx;
              // Check collision with left
              if( me.x < 0 )
                me.x = 0;
            }
            // If moving right
            if( keyboard.keyDown( KeyEvent.VK_RIGHT ) || keyboard.keyDown( KeyEvent.VK_D ))
            {
              me.x += me.dx;
              // Check collision with right
              if( me.x + me.w > WIDTH - 1 )
                me.x = WIDTH - me.w - 1;
            }
        }
        if(input2 == "M")
        {
            Point p = MouseInfo.getPointerInfo().getLocation();
            int x = p.x;
            int y = p.y;
            if (me.x < p.x && me.x + me.dx < WIDTH - 25)
            {
                me.x = me.x + me.dx;
            }
            if (me.x > p.x && me.x - me.dx > 0)
            {
                me.x = me.x - me.dx;
            }
            if (me.y < p.y && me.y + me.dy < HEIGHT - 25)
            {
                me.y = me.y + me.dy;
            }
            if (me.y > p.y && me.y - me.dy > 0)
            {
                me.y = me.y - me.dy;
            }
            Thread.sleep(10);
        }
        
        Point abc = null;
        for( Point p : circles2 ) 
        {
           if (me.x - p.x <= 10 && me.x - p.x >= -10 && me.y - p.y <= 10 && me.y - p.y >= -10)
           {
              points = points + 20;
              eaten++;
              if (points > 1000)
              {
                  points = points + 10;
              }
              abc = p;
              break;
           }
        }
        if (abc != null)
        {
            circles2.remove(abc);
        }
        
        Point a = null;
        for( Point p : circles ) 
        {
           if (me.x - p.x <= 10 && me.x - p.x >= -10 && me.y - p.y <= 10 && me.y - p.y >= -10)
           {
              points = points + 10;
              eaten++;
              if (points > 1000)
              {
                  points = points + 10;
              }
              a = p;
              break;
           }
        }
        if (a != null)
        {
            circles.remove(a);
        }
        
        Point b = null;
        for( Point p : curved ) 
        {
           if (me.x - p.x <= 10 && me.x - p.x >= -10 && me.y - p.y <= 10 && me.y - p.y >= -10 && points >= 10)
           {
              points = points - 10;
              b = p;
              break;
           }
        }
        if (b != null)
        {
            curved.remove(b);
        }
        
        Point c = null;
        for( Point p : xyz ) 
        {
           if (me.x - p.x <= 10 && me.x - p.x >= -10 && me.y - p.y <= 10 && me.y - p.y >= -10 && points >= 5)
           {
              points = 0;
              c = p;
              break;
           }
        }
        if (c != null)
        {
            xyz.remove(c);
        }
        Point z = null;
        
        for( Point p : rectangles ) 
        {
           if (me.x - p.x <= 10 && me.x - p.x >= -10 && me.y - p.y <= 10 && me.y - p.y >= -10)
           {
               gameover = true;
               //System.out.println("Rectangles");
           }
        }
        
        
        for (int i = 0; i < xy.size(); i++)
        {
            /*if ((xy.get(i).getX() == me.x )&& xy.get(i).getY() == me.y)
            {
                
            }*/
            if (me.x - xy.get(i).getX() <= 20 && me.x - xy.get(i).getX() >= -20 && me.y - xy.get(i).getY() <= 20 && me.y - xy.get(i).getY() >= -20)
            {
                gameover = true;
            }
        }
        
        
    }
    
    public static void main(String input, int money, int xysize, int points2) throws InterruptedException , IOException
    {
        input2 = input;
        money2 = money; 
        xy.clear();
        for (int i = 0; i < xysize; i++) 
        {
            xy.add(new enem (0, 0, true));
        }
        points = points2;
        pointCheck = points;
        if (xysize > 0)
        {
            revival = true;
        }
        original app = new original();
        app.setTitle( "Video Game" );
        app.setVisible( true );
        app.run();
        System.exit( 0 );
    }
}