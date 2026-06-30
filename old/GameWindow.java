import java.awt.Canvas;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GraphicsConfiguration;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.image.BufferStrategy;
import java.awt.image.BufferedImage;
import javax.swing.JFrame;

public final class GameWindow extends JFrame {
    private static GameWindow instance;

    private final KeyboardInput keyboard = new KeyboardInput();
    private final Canvas canvas;
    private final BufferedImage backBuffer;
    private boolean bufferReady;

    public static GameWindow getInstance() {
        if (instance == null) {
            instance = new GameWindow();
        }
        return instance;
    }

    private GameWindow() {
        setTitle("Video Game");
        setIgnoreRepaint(true);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        canvas = new Canvas();
        canvas.setIgnoreRepaint(true);
        canvas.setSize(GameConstants.WIDTH, GameConstants.HEIGHT);
        add(canvas);
        pack();
        addKeyListener(keyboard);
        canvas.addKeyListener(keyboard);
        backBuffer = createDefaultBackBuffer();
        setVisible(true);
    }

    public static BufferedImage createDefaultBackBuffer() {
        GraphicsEnvironment environment = GraphicsEnvironment.getLocalGraphicsEnvironment();
        GraphicsDevice device = environment.getDefaultScreenDevice();
        GraphicsConfiguration configuration = device.getDefaultConfiguration();
        return configuration.createCompatibleImage(GameConstants.WIDTH, GameConstants.HEIGHT);
    }

    public void runScreen(GameScreen screen) throws InterruptedException {
        if (!bufferReady) {
            canvas.createBufferStrategy(2);
            bufferReady = true;
        }

        BufferStrategy buffer = canvas.getBufferStrategy();
        screen.onEnter(keyboard);
        try {
            while (!screen.isDone()) {
                keyboard.poll();

                Graphics graphics = null;
                Graphics2D graphics2D = null;
                try {
                    graphics2D = backBuffer.createGraphics();
                    graphics2D.setColor(Color.BLACK);
                    graphics2D.fillRect(0, 0, GameConstants.WIDTH, GameConstants.HEIGHT);
                    screen.update(graphics2D);

                    graphics = buffer.getDrawGraphics();
                    graphics.drawImage(backBuffer, 0, 0, null);
                    if (!buffer.contentsLost()) {
                        buffer.show();
                    }
                    Thread.sleep(10);
                } finally {
                    if (graphics != null) {
                        graphics.dispose();
                    }
                    if (graphics2D != null) {
                        graphics2D.dispose();
                    }
                }
            }
        } finally {
            screen.onExit();
        }
    }

    public BufferedImage getBackBuffer() {
        return backBuffer;
    }
}
