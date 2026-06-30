import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.event.KeyEvent;
import java.io.IOException;
import java.util.Random;
import java.util.Vector;

public class Gravity implements GameScreen {
    private final Player player = new Player();
    private final Vector<MovingCircle> fallingCircles = new Vector<MovingCircle>();
    private final Vector<MovingCircle> risingCircles = new Vector<MovingCircle>();
    private final Random random = new Random();

    private KeyboardInput keyboard;
    private String controlScheme = "";
    private int money = 0;
    private boolean gameOver = false;
    private boolean quitToMenu = false;
    private int enemySpeed = 1;
    private int points = 0;

    public static Gravity create(String control, int startingMoney) {
        Gravity game = new Gravity();
        game.controlScheme = control;
        game.money = startingMoney;
        game.player.center();
        game.fallingCircles.clear();
        game.risingCircles.clear();
        game.gameOver = false;
        game.quitToMenu = false;
        game.enemySpeed = 1;
        game.points = 0;
        return game;
    }

    public boolean isQuitToMenu() {
        return quitToMenu;
    }

    public int getMoney() {
        return money;
    }

    @Override
    public void onEnter(KeyboardInput keyboard) {
        this.keyboard = keyboard;
    }

    @Override
    public void update(Graphics2D graphics) throws InterruptedException {
        if (keyboard.keyDownOnce(KeyEvent.VK_ESCAPE)) {
            quitToMenu = true;
            gameOver = true;
        }

        graphics.setColor(Color.GREEN);
        graphics.drawString("Run from the circles", 20, 20);
        graphics.drawString("Use the arrow keys or WASD to move the circle", 20, 32);
        graphics.drawString("Red is Dead!", 20, 44);
        graphics.drawString("Points: " + points, 20, 56);
        graphics.drawString("$" + money, 20, 68);

        processInput();

        graphics.setColor(Color.RED);
        for (MovingCircle circle : fallingCircles) {
            graphics.drawOval(circle.x, circle.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }
        for (MovingCircle circle : risingCircles) {
            graphics.drawOval(circle.x, circle.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }

        graphics.setColor(Color.GREEN);
        graphics.drawOval(player.x, player.y, player.h, player.w);
        graphics.drawString("Player", player.x - 5, player.y);
    }

    @Override
    public boolean isDone() {
        return gameOver;
    }

    private void processInput() throws InterruptedException {
        if (random.nextInt(15) == 1) {
            fallingCircles.add(new MovingCircle(random.nextInt(GameConstants.WIDTH), random.nextInt(GameConstants.HEIGHT - 100)));
        }
        if (random.nextInt(15) == 1) {
            risingCircles.add(new MovingCircle(random.nextInt(GameConstants.WIDTH - 100), random.nextInt(GameConstants.HEIGHT - 100)));
        }
        if (random.nextInt(1000) == 1 && enemySpeed < 10) {
            enemySpeed++;
        }

        for (MovingCircle circle : fallingCircles) {
            if (circle.y > 25 && circle.y < 975) {
                circle.y += enemySpeed;
            }
        }
        for (MovingCircle circle : risingCircles) {
            if (circle.y > 0 && circle.y < 975) {
                circle.y -= enemySpeed;
            }
        }

        if ("W".equals(controlScheme)) {
            if (keyboard.keyDown(KeyEvent.VK_LEFT) || keyboard.keyDown(KeyEvent.VK_A)) {
                player.x -= player.dx;
                if (player.x < 0) {
                    player.x = 0;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_RIGHT) || keyboard.keyDown(KeyEvent.VK_D)) {
                player.x += player.dx;
                if (player.x + player.w > GameConstants.WIDTH - 1) {
                    player.x = GameConstants.WIDTH - player.w - 1;
                }
            }
        } else if ("M".equals(controlScheme)) {
            GameUtils.movePlayerMouse(player);
        }

        for (MovingCircle circle : risingCircles) {
            if (GameUtils.overlaps(player, circle.x, circle.y, 20)) {
                gameOver = true;
                return;
            }
        }
        for (MovingCircle circle : fallingCircles) {
            if (GameUtils.overlaps(player, circle.x, circle.y, 20)) {
                gameOver = true;
                return;
            }
        }
    }

    public static void main(String control, int startingMoney, java.awt.image.BufferedImage buffer)
        throws InterruptedException, IOException {
        GameApp.runGravity(control, startingMoney);
    }

    private static class MovingCircle {
        int x;
        int y;

        MovingCircle(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }
}
