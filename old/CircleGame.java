import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Point;
import java.awt.event.KeyEvent;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Random;
import java.util.Vector;

public class CircleGame implements GameScreen {
    public enum Mode { ORIGINAL, SWARM }

    private static final ArrayList<Enemy> enemies = new ArrayList<Enemy>();
    private static final Random random = new Random();

    private final Mode mode;
    private final Player player = new Player();
    private final Vector<Point> circles = new Vector<Point>();
    private final Vector<Point> circles2 = new Vector<Point>();
    private final Vector<Point> rectangles = new Vector<Point>();
    private final Vector<Point> curved = new Vector<Point>();
    private final Vector<Point> pointResetters = new Vector<Point>();

    private KeyboardInput keyboard;
    private String controlScheme = "";
    private int money = 0;
    private int eaten = 0;
    private int level = 0;
    private int points = 0;
    private int pointCheck = 0;
    private int orbX = random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE);
    private int orbY = random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE);
    private boolean orbAlive = true;
    private boolean gameOver = false;
    private boolean quitToMenu = false;
    private boolean orbCollected = false;
    private int enemySpeed = 1;

    private CircleGame(Mode mode) {
        this.mode = mode;
    }

    public static CircleGame create(String control, int startingMoney, Mode mode, int enemyCount, int startingPoints) {
        CircleGame game = new CircleGame(mode);
        game.controlScheme = control;
        game.money = startingMoney;
        game.level = 0;
        game.points = startingPoints;
        game.pointCheck = startingPoints;
        game.eaten = 0;
        game.player.center();
        game.resetOrb();
        game.circles.clear();
        game.circles2.clear();
        game.rectangles.clear();
        game.curved.clear();
        game.pointResetters.clear();
        game.gameOver = false;
        game.quitToMenu = false;
        game.enemySpeed = 1;
        enemies.clear();
        for (int i = 0; i < enemyCount; i++) {
            enemies.add(new Enemy(0, 0, true));
        }
        return game;
    }

    public boolean isQuitToMenu() {
        return quitToMenu;
    }

    public int getMoney() {
        return money;
    }

    public int getPoints() {
        return points;
    }

    public int getEnemyCount() {
        return enemies.size();
    }

    public Mode getMode() {
        return mode;
    }

    public int applySessionEarnings() throws IOException {
        money = level / 2 + money;
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

        drawHud(graphics);
        processInput();
        drawWorld(graphics);
    }

    @Override
    public boolean isDone() {
        return gameOver;
    }

    private void resetOrb() {
        orbAlive = true;
        orbX = random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE);
        orbY = random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE);
        orbCollected = false;
    }

    private void drawHud(Graphics2D graphics) {
        graphics.setColor(Color.GREEN);
        graphics.drawString("Try to get all the pink circles", 20, 20);
        graphics.drawString("Use the arrow keys or WASD to move the circle", 20, 32);
        graphics.drawString("Pink is great don't you think?", 20, 44);
        graphics.drawString("Blue is a Wa-ha-hoo!", 20, 56);
        graphics.drawString("White ain't a good sight", 20, 68);
        graphics.drawString("Red is dead!", 20, 80);
        graphics.drawString("Press ESC to exit", 20, 104);
        graphics.drawString(controlScheme, 20, 118);
        graphics.drawString("$" + money, 20, 130);
        graphics.drawString("Level: " + (level == 0 ? 1 : level), 20, 140);
        graphics.drawString("Points: " + points, 20, 152);
    }

    private void drawWorld(Graphics2D graphics) {
        graphics.setColor(Color.MAGENTA);
        for (Point point : circles) {
            graphics.drawOval(point.x, point.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }
        for (Point point : circles2) {
            graphics.drawOval(point.x, point.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }

        graphics.setColor(Color.RED);
        for (Enemy enemy : enemies) {
            graphics.drawString("Enemy", enemy.getX() - 6, enemy.getY());
            graphics.drawOval(enemy.getX(), enemy.getY(), GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }

        if (orbAlive) {
            graphics.setColor(Color.CYAN);
            graphics.drawOval(orbX, orbY, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }

        graphics.setColor(Color.WHITE);
        for (Point point : curved) {
            graphics.drawRoundRect(point.x, point.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE, 15, 15);
        }
        if (mode == Mode.ORIGINAL) {
            for (Point point : rectangles) {
                graphics.drawRect(point.x, point.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
            }
        }
        for (Point point : pointResetters) {
            graphics.drawRect(point.x, point.y, GameConstants.ENTITY_SIZE, GameConstants.ENTITY_SIZE);
        }

        graphics.setColor(Color.GREEN);
        graphics.drawOval(player.x, player.y, player.h, player.w);
        graphics.drawString("Player", player.x - 5, player.y);
    }

    private void processInput() throws InterruptedException {
        int orbSpawnRoll = random.nextInt(10000);
        updateLeveling();
        spawnEnemiesOnEatCount();
        updateOrb(orbSpawnRoll);
        moveEnemies();
        spawnCollectibles();
        GameUtils.moveOrbTowardPlayers(new int[] { orbX, orbY }, player);
        movePlayer();
        handleCollisions();
    }

    private void updateLeveling() {
        if (mode == Mode.ORIGINAL) {
            if (points > Math.pow(10, level)) {
                level++;
                resetOrb();
            } else if (points > Math.pow(10, level) / 2) {
                resetOrb();
            }
            return;
        }

        if (points > level * 50 && points > pointCheck) {
            level++;
            enemies.add(new Enemy(
                random.nextInt(GameConstants.WIDTH - 100),
                random.nextInt(GameConstants.HEIGHT - 100),
                true
            ));
            resetOrb();
        }
    }

    private void spawnEnemiesOnEatCount() {
        if (mode != Mode.ORIGINAL) {
            return;
        }
        if (eaten == 5 && points < 1000) {
            enemies.add(new Enemy(random.nextInt(GameConstants.WIDTH - 100), random.nextInt(GameConstants.HEIGHT - 100), true));
            eaten = 0;
        }
        if (eaten == 10 && points < 10000) {
            enemies.add(new Enemy(random.nextInt(GameConstants.WIDTH - 100), random.nextInt(GameConstants.HEIGHT - 100), true));
            eaten = 0;
        }
        if (eaten == 20 && points < 100000) {
            enemies.add(new Enemy(random.nextInt(GameConstants.WIDTH - 100), random.nextInt(GameConstants.HEIGHT - 100), true));
            eaten = 0;
        }
    }

    private void updateOrb(int orbSpawnRoll) {
        if (orbSpawnRoll == 1 && !orbAlive) {
            resetOrb();
        }
        if (GameUtils.overlaps(player, orbX, orbY, 10) && !orbCollected) {
            if (mode == Mode.ORIGINAL) {
                rectangles.clear();
            }
            curved.clear();
            pointResetters.clear();
            orbAlive = false;
            repositionEnemies();
            points *= 2;
            orbCollected = true;
        }
    }

    private void repositionEnemies() {
        for (Enemy enemy : enemies) {
            enemy.setAlive(true);
            if (player.x - 100 > 0) {
                enemy.setX(random.nextInt(player.x - 100));
            } else {
                enemy.setX(GameConstants.WIDTH - random.nextInt(200));
            }
            if (player.y - 100 > 0) {
                enemy.setY(random.nextInt(player.y - 100));
            } else {
                enemy.setY(GameConstants.HEIGHT - random.nextInt(200));
            }
        }
    }

    private void moveEnemies() {
        for (Enemy enemy : enemies) {
            GameUtils.moveToward(enemy, player.x, player.y, enemySpeed);
        }
    }

    private void spawnCollectibles() {
        int circleChance = mode == Mode.ORIGINAL ? 10 : 100;
        if (random.nextInt(circleChance) == 1 && circles.size() < 25) {
            circles.add(new Point(random.nextInt(GameConstants.WIDTH - 100), random.nextInt(GameConstants.HEIGHT - 100)));
        }
        if (random.nextInt(circleChance) == 1 && circles2.size() < 25) {
            circles2.add(new Point(random.nextInt(GameConstants.WIDTH - 100), random.nextInt(GameConstants.HEIGHT - 100)));
        }
        if (mode == Mode.ORIGINAL && random.nextInt(100) == 1 && rectangles.size() < 30) {
            rectangles.add(new Point(random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE), random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE)));
        }
        if (random.nextInt(100) == 1 && curved.size() < 25) {
            curved.add(new Point(random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE), random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE)));
        }
        if (random.nextInt(500) == 1 && pointResetters.size() < 15) {
            pointResetters.add(new Point(random.nextInt(GameConstants.WIDTH - GameConstants.ENTITY_SIZE), random.nextInt(GameConstants.HEIGHT - GameConstants.ENTITY_SIZE)));
        }
    }

    private void movePlayer() throws InterruptedException {
        if ("W".equals(controlScheme)) {
            GameUtils.movePlayerWasd(player, keyboard);
        } else if ("M".equals(controlScheme)) {
            GameUtils.movePlayerMouse(player);
        }
    }

    private void handleCollisions() {
        Point hit = GameUtils.findCollidingPoint(player, circles2, 10);
        if (hit != null) {
            points += points > 1000 ? 30 : 20;
            if (mode == Mode.ORIGINAL) {
                eaten++;
            }
            circles2.remove(hit);
        }

        hit = GameUtils.findCollidingPoint(player, circles, 10);
        if (hit != null) {
            points += points > 1000 ? 20 : 10;
            if (mode == Mode.ORIGINAL) {
                eaten++;
            }
            circles.remove(hit);
        }

        hit = GameUtils.findCollidingPoint(player, curved, 10);
        if (hit != null && points >= 10) {
            points -= 10;
            curved.remove(hit);
        }

        hit = GameUtils.findCollidingPoint(player, pointResetters, 10);
        if (hit != null && points >= 5) {
            points = 0;
            pointResetters.remove(hit);
        }

        if (mode == Mode.ORIGINAL && GameUtils.findCollidingPoint(player, rectangles, 10) != null) {
            gameOver = true;
        }

        for (Enemy enemy : enemies) {
            if (GameUtils.overlaps(player, enemy, 20)) {
                gameOver = true;
            }
        }
    }

    public static void main(String control, int startingMoney, Mode mode, int enemyCount, int startingPoints)
        throws InterruptedException, IOException {
        GameApp.runCircleGame(control, startingMoney, mode, enemyCount, startingPoints);
    }
}
