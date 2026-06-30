import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.event.KeyEvent;
import java.io.IOException;
import java.util.Random;

public class tpv implements GameScreen {
    private final Player greenPlayer = new Player();
    private final Player redPlayer = new Player();
    private final Random random = new Random();

    private KeyboardInput keyboard;
    private String controlScheme = "";
    private int money = 0;
    private int orbX = GameConstants.WIDTH / 2;
    private int orbY = GameConstants.HEIGHT / 2;
    private int greenPoints = 0;
    private int redPoints = 0;
    private int greenTeleports = 0;
    private int redTeleports = 0;
    private boolean gameOver = false;
    private boolean quitToMenu = false;
    private boolean orbAlive = true;
    private boolean orbCollected = false;
    private String victor = "";

    public static tpv create(String control, int startingMoney) {
        tpv game = new tpv();
        game.controlScheme = control;
        game.money = startingMoney;
        game.greenPlayer.x = game.greenPlayer.y = 0;
        game.redPlayer.x = game.redPlayer.y = GameConstants.WIDTH - GameConstants.ENTITY_SIZE;
        game.orbX = GameConstants.WIDTH / 2;
        game.orbY = GameConstants.HEIGHT / 2;
        game.greenPoints = 0;
        game.redPoints = 0;
        game.greenTeleports = 0;
        game.redTeleports = 0;
        game.gameOver = false;
        game.quitToMenu = false;
        game.orbAlive = true;
        game.orbCollected = false;
        game.victor = "";
        return game;
    }

    public boolean isQuitToMenu() {
        return quitToMenu;
    }

    public int getMoney() {
        return money;
    }

    public int applySessionEarnings() throws IOException {
        money += 5;
        MoneyStore.addEarnings(money);
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

        graphics.setColor(Color.WHITE);
        graphics.drawString("Try to get all the pink circles", 20, 20);
        graphics.drawString("Use the arrow keys or WASD to move your circle", 20, 32);
        graphics.drawString("Find what each key does!", 20, 48);
        graphics.drawString("Press ESC to exit", 20, 60);
        graphics.drawString("Green's Points:" + greenPoints, 20, 72);
        graphics.drawString("Red's Points: " + redPoints, 20, 84);
        graphics.drawString(controlScheme, 20, 96);

        processInput();

        if (orbAlive) {
            graphics.setColor(Color.CYAN);
            graphics.drawOval(orbX, orbY, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }

        graphics.setColor(Color.GREEN);
        graphics.drawOval(greenPlayer.x, greenPlayer.y, greenPlayer.h, greenPlayer.w);
        graphics.drawString("Blue: 20", greenPlayer.x - 10, greenPlayer.y);

        graphics.setColor(Color.RED);
        graphics.drawOval(redPlayer.x, redPlayer.y, redPlayer.h, redPlayer.w);
        graphics.drawString("Red: 20", redPlayer.x - 10, redPlayer.y);

        if (gameOver && (greenPoints > 2 || redPoints > 2)) {
            graphics.setColor(greenPoints > redPoints ? Color.GREEN : Color.RED);
            graphics.drawString("Winner is: " + victor, 475, 470);
        }
    }

    @Override
    public boolean isDone() {
        return gameOver;
    }

    private void processInput() {
        if (!orbAlive && (greenPoints > 0 || redPoints > 0)) {
            orbAlive = true;
            orbX = random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE);
            orbY = random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE);
            orbCollected = false;
        }

        if (GameUtils.overlaps(greenPlayer, orbX, orbY, 10) && !orbCollected) {
            orbAlive = false;
            orbCollected = true;
            greenPoints++;
        }
        if (GameUtils.overlaps(redPlayer, orbX, orbY, 10) && !orbCollected) {
            orbAlive = false;
            orbCollected = true;
            redPoints++;
        }

        GameUtils.moveOrbTowardPlayers(new int[] { orbX, orbY }, greenPlayer, redPlayer);

        if ("W".equals(controlScheme) || "M".equals(controlScheme)) {
            int greenMoved = 0;
            if (keyboard.keyDown(KeyEvent.VK_S)) {
                greenPlayer.y += greenPlayer.dy;
                greenMoved = 1;
                if (greenPlayer.y + greenPlayer.h > GameConstants.HEIGHT - 1) {
                    greenPlayer.y = GameConstants.HEIGHT - greenPlayer.h - 1;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_W)) {
                greenPlayer.y -= greenPlayer.dy;
                greenMoved = 1;
                if (greenPlayer.y < 0) {
                    greenPlayer.y = 0;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_A)) {
                greenPlayer.x -= greenPlayer.dx;
                greenMoved = 1;
                if (greenPlayer.x < 0) {
                    greenPlayer.x = 0;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_D)) {
                greenPlayer.x += greenPlayer.dx;
                greenMoved = 1;
                if (greenPlayer.x + greenPlayer.w > GameConstants.WIDTH - 1) {
                    greenPlayer.x = GameConstants.WIDTH - greenPlayer.w - 1;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_SPACE) && greenTeleports < 3) {
                orbX = random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE);
                orbY = random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE);
                greenTeleports++;
            }
            if (keyboard.keyDown(KeyEvent.VK_Q) && greenMoved == 0) {
                greenPlayer.x = GameConstants.WIDTH - greenPlayer.x;
                greenPlayer.y = GameConstants.HEIGHT - greenPlayer.y;
            }

            if (keyboard.keyDown(KeyEvent.VK_DOWN)) {
                redPlayer.y += redPlayer.dy;
                if (redPlayer.y + redPlayer.h > GameConstants.HEIGHT - 1) {
                    redPlayer.y = GameConstants.HEIGHT - redPlayer.h - 1;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_UP)) {
                redPlayer.y -= redPlayer.dy;
                if (redPlayer.y < 0) {
                    redPlayer.y = 0;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_LEFT)) {
                redPlayer.x -= redPlayer.dx;
                if (redPlayer.x < 0) {
                    redPlayer.x = 0;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_RIGHT)) {
                redPlayer.x += redPlayer.dx;
                if (redPlayer.x + redPlayer.w > GameConstants.WIDTH - 1) {
                    redPlayer.x = GameConstants.WIDTH - redPlayer.w - 1;
                }
            }
            if (keyboard.keyDown(KeyEvent.VK_CONTROL) && redTeleports < 3) {
                orbX = random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE);
                orbY = random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE);
                redTeleports++;
            }
            if (keyboard.keyDown(KeyEvent.VK_SHIFT)) {
                redPlayer.x = GameConstants.WIDTH - redPlayer.x;
                redPlayer.y = GameConstants.HEIGHT - redPlayer.y;
            }
        }

        if (redPoints == 3) {
            gameOver = true;
            victor = "Red";
        }
        if (greenPoints == 3) {
            gameOver = true;
            victor = "Green";
        }
    }

    public static void main(String control, int startingMoney, java.awt.image.BufferedImage buffer)
        throws InterruptedException, IOException {
        GameApp.runFighter(control, startingMoney);
    }
}
