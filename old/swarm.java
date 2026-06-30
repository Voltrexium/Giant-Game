import java.io.IOException;

public class swarm {
    public static void main(String input, int money, int enemyCount, int points)
        throws InterruptedException, IOException {
        CircleGame.main(input, money, CircleGame.Mode.SWARM, enemyCount, points);
    }
}
