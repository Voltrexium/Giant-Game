import java.awt.Point;
import java.awt.event.KeyEvent;

public final class GameUtils {
    private GameUtils() {}

    public static boolean overlaps(int ax, int ay, int bx, int by, int tolerance) {
        return ax - bx <= tolerance && ax - bx >= -tolerance
            && ay - by <= tolerance && ay - by >= -tolerance;
    }

    public static boolean overlaps(Player a, int bx, int by, int tolerance) {
        return overlaps(a.x, a.y, bx, by, tolerance);
    }

    public static boolean overlaps(Player a, Enemy b, int tolerance) {
        return overlaps(a.x, a.y, b.getX(), b.getY(), tolerance);
    }

    public static Point findCollidingPoint(Player player, Iterable<Point> points, int tolerance) {
        for (Point point : points) {
            if (overlaps(player.x, player.y, point.x, point.y, tolerance)) {
                return point;
            }
        }
        return null;
    }

    public static void moveToward(Enemy enemy, int targetX, int targetY, int speed) {
        if (enemy.getX() < targetX) {
            enemy.setX(enemy.getX() + speed);
        }
        if (enemy.getX() > targetX) {
            enemy.setX(enemy.getX() - speed);
        }
        if (enemy.getY() < targetY) {
            enemy.setY(enemy.getY() + speed);
        }
        if (enemy.getY() > targetY) {
            enemy.setY(enemy.getY() - speed);
        }
    }

    public static void movePlayerWasd(Player player, KeyboardInput keyboard) {
        if (keyboard.keyDown(KeyEvent.VK_DOWN) || keyboard.keyDown(KeyEvent.VK_S)) {
            player.y += player.dy;
            if (player.y + player.h > GameConstants.HEIGHT - 1) {
                player.y = GameConstants.HEIGHT - player.h - 1;
            }
        }
        if (keyboard.keyDown(KeyEvent.VK_UP) || keyboard.keyDown(KeyEvent.VK_W)) {
            player.y -= player.dy;
            if (player.y < 0) {
                player.y = 0;
            }
        }
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
    }

    public static void movePlayerMouse(Player player) throws InterruptedException {
        Point pointer = java.awt.MouseInfo.getPointerInfo().getLocation();
        if (player.x < pointer.x && player.x + player.dx < GameConstants.WIDTH - GameConstants.ENTITY_SIZE) {
            player.x += player.dx;
        }
        if (player.x > pointer.x && player.x - player.dx > 0) {
            player.x -= player.dx;
        }
        if (player.y < pointer.y && player.y + player.dy < GameConstants.HEIGHT - GameConstants.ENTITY_SIZE) {
            player.y += player.dy;
        }
        if (player.y > pointer.y && player.y - player.dy > 0) {
            player.y -= player.dy;
        }
        Thread.sleep(10);
    }

    public static void moveOrbTowardPlayers(int[] orb, Player... players) {
        for (Player player : players) {
            if (orb[0] < player.x || orb[0] >= GameConstants.HEIGHT - GameConstants.ENTITY_SIZE) {
                orb[0]--;
            }
            if (orb[0] > player.x || orb[0] <= 0) {
                orb[0]++;
            }
            if (orb[1] < player.y || orb[1] >= GameConstants.WIDTH - GameConstants.ENTITY_SIZE) {
                orb[1]--;
            }
            if (orb[1] > player.y || orb[1] <= 0) {
                orb[1]++;
            }
        }
    }
}
